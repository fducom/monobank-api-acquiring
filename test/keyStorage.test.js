const assert = require('assert');
const KeyStorage = require('../lib/keyStorage');

describe('KeyStorage', () => {
    let keyStorage;

    before(() => {
        // Ініціалізуємо об'єкт KeyStorage перед кожним тестом
        const options = {
            storageType: 'sqlite',
        };
        keyStorage = new KeyStorage(options);
    });

    describe('#savePublicKey', () => {
        it('should save the public key for the specified token', async() => {
            const token = 'example-token';
            const publicKey = 'example-public-key';

            await keyStorage.savePublicKey(token, publicKey);

            // Перевіряємо, чи був ключ збережений
            const savedPublicKey = await keyStorage.getPublicKey(token);
            assert.strictEqual(savedPublicKey, publicKey);
        });
    });

    describe('#getPublicKey', () => {
        it('should return the public key for the specified token', async() => {
            const token = 'example-token';
            const publicKey = 'example-public-key';

            // Зберігаємо ключ перед отриманням
            await keyStorage.savePublicKey(token, publicKey);

            // Отримуємо ключ і перевіряємо його правильність
            const retrievedPublicKey = await keyStorage.getPublicKey(token);
            assert.strictEqual(retrievedPublicKey, publicKey);
        });

        it('should return null for non-existent token', async() => {
            const token = 'non-existent-token';

            // Отримуємо ключ для неіснуючого токена
            const retrievedPublicKey = await keyStorage.getPublicKey(token);
            assert.strictEqual(retrievedPublicKey, null);
        });
    });
});