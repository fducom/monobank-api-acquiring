/* 
MonobankApiAcquriring
Автор: Дмитро Федорчук - CTO/CIO Wepster
Розроблено за підтримки проекту wepster.com 
2023 - Ми переможемо!
*/

const axios = require('axios');
const KeyStorage = require('./keyStorage');
const crypto = require('crypto');



class MonobankApiAcquriring {
    /**
     * Клас для взаємодії з API Monobank для мерчантів.
     * @param {string} token Токен мерчанта для доступу до API Monobank.
     * @param {string} keyStorageOptions Параметри конфігурації
     */
    constructor(token, keyStorageOptions) {
        this.token = token;
        this.baseUrl = 'https://api.monobank.ua/api/merchant/';
        this.keyStorage = new KeyStorage(keyStorageOptions);
    }

    /**
     * Виконує HTTP-запит до Monobank API.
     *
     * @param {string} method - HTTP-метод (GET, POST, тощо).
     * @param {string} url - URL-адреса ендпоінту API.
     * @param {object} data - Дані запиту (необов'язково).
     * @returns {Promise<object>} - Об'єкт з даними відповіді API.
     */
    async makeRequest(method, url, data = null) {

        try {
            const headers = {
                'Content-Type': 'application/json',
                'X-Token': this.token,
            };
            console.log(method, `${this.baseUrl}${url}`, data)
            const response = await axios({
                method,
                url: `${this.baseUrl}${url}`,
                headers,
                data,
            });

            return response.data;
        } catch (error) {
            throw new Error(`Monobank API request failed: ${error.message}`);
        }
    }

    /**
     * Перевіряє підпис вебхука.
     * @param {string} signature Підпис вебхука.
     * @param {string} message Повідомлення вебхука.
     * @returns {Promise<boolean>} Значення true, якщо підпис перевірений успішно, або false - якщо перевірка не пройшла.
     */
    async verifyWebhookSignature(signature, message) {
        let publicKey = await this.keyStorage.getTokenPublicKey(this.token);

        if (!publicKey) {
            const { publicKey: newPublicKey } = await this.makeRequest('GET', 'pubkey');
            publicKey = newPublicKey;
            await this.keyStorage.addTokenPublicKey(this.token, publicKey);
        }

        const signatureBuf = Buffer.from(signature, 'base64');
        const publicKeyBuf = Buffer.from(publicKey, 'base64');

        const verify = crypto.createVerify('SHA256');
        verify.write(message);
        verify.end();

        const initialVerification = verify.verify(publicKeyBuf, signatureBuf);

        if (!initialVerification) {
            // Retry with the new public key
            const { publicKey: updatedPublicKey } = await this.makeRequest('GET', 'pubkey');
            await this.keyStorage.updateTokenPublicKey(this.token, updatedPublicKey);

            const updatedPublicKeyBuf = Buffer.from(updatedPublicKey, 'base64');
            const retryVerification = verify.verify(updatedPublicKeyBuf, signatureBuf);
            return retryVerification;
        }

        return initialVerification;
    }

    /**
     * Оброблює запит вебхука.
     * @param {object} req Об'єкт, що представляє HTTP-запит вебхука.
     * @returns {Promise<object>} Об'єкт з відповіддю на запит вебхука.
     * @throws {Error} Якщо перевірка підпису вебхука не пройшла успішно.
     */
    async handleWebhookRequest(req) {
        const xSign = req.headers['x-sign'];
        const body = req.body;

        if (!await this.verifyWebhookSignature(xSign, JSON.stringify(body))) {
            throw new Error('Webhook signature verification failed');
        }

        return true
    }

    /**
     * Отримує публічний ключ для перевірки підписів.
     * @returns {Promise<string>} Публічний ключ.
     */
    async getPublicKey() {
        try {
            const publicKey = await this.makeRequest('GET', 'pubkey');
            return publicKey;
        } catch (error) {
            console.error('Failed to get Public Key:', error);
            throw error;
        }
    }


    /**
     * Створює новий рахунок.
     *
     * @param {object} invoiceData - Дані для створення рахунку.
     * @returns {Promise<object>} - Об'єкт з даними рахунку.
     */
    async createInvoice(invoiceData) {

        const endpoint = 'invoice/create';

        try {
            const response = await this.makeRequest('POST', endpoint, invoiceData);
            return response;
        } catch (error) {
            console.error('Failed to create invoice:', error);
            throw error;
        }
    }

    /**
     * Отримує статус рахунку за його ідентифікатором.
     *
     * @param {string} invoiceId - Ідентифікатор рахунку.
     * @returns {Promise<object>} - Об'єкт з даними статусу рахунку.
     */
    async getInvoiceStatus(invoiceId) {
        const endpoint = `invoice/status?invoiceId=${invoiceId}`;

        try {
            const response = await this.makeRequest('GET', endpoint);
            return response;
        } catch (error) {
            console.error('Failed to get invoice status:', error);
            throw error;
        }
    }



    /**
     * Отримує дані гаманця за його ідентифікатором.
     *
     * @param {string} walletId - Ідентифікатор гаманця.
     * @returns {Promise<object>} - Об'єкт з даними гаманця.
     */
    async getWallet(walletId) {
        const endpoint = `wallet?walletId=${walletId}`;

        try {
            const response = await this.makeRequest('GET', endpoint);
            return response;
        } catch (error) {
            console.error('Failed to get wallet:', error);
            throw error;
        }
    }


    /**
     * Видалення токенізованої картки.
     * @param {string} cardToken - Токен картки для видалення.
     * @returns {Promise<Object>} Об'єкт з результатом видалення картки.
     */
    async deleteCard(cardToken) {
        const url = `wallet/card?cardToken=${cardToken}`;
        try {
            return this.makeRequest('DELETE', url);
        } catch (error) {
            console.error('Failed to DELETE card by token:', error);
            throw error;
        }
    }

    /**
     * Ініціює платіж з гаманця.
     *
     * @param {object} paymentData - Дані для ініціювання платежу.
     * @returns {Promise<object>} - Об'єкт з даними платежу.
     */
    async initiateWalletPayment(paymentData) {
        const endpoint = 'wallet/payment';

        try {
            const response = await this.makeRequest('POST', endpoint, paymentData);
            return response;
        } catch (error) {
            console.error('Failed to initiate wallet payment:', error);
            throw error;
        }
    }
}

module.exports = MonobankApiAcquriring;