const { promisify } = require('util');
const sqlite3 = require('sqlite3');

class KeyStorage {
    /**
     * Конструктор класу KeyStorage
     * @param {Object} options - Параметри конфігурації
     * @param {string} options.storageType - Тип сховища ключів ("redis" або "sqlite")
     * @param {string} options.redisClient - Передати клієнт redisClient = redis.createClient
     */
    constructor(options) {
        this.storageType = options.storageType;
        this.storagePath = './storage.db';
        this.redisClient = options.redisClient;

        if (this.storageType === 'redis') {
            // Ініціалізація Redis-клієнта
            this.client = redisClient;
            this.getAsync = promisify(this.client.get).bind(this.client);
            this.setAsync = promisify(this.client.set).bind(this.client);
        } else if (this.storageType === 'sqlite') {
            // Ініціалізація бази даних SQLite
            this.db = new sqlite3.Database(this.storagePath);
            this.db.run('CREATE TABLE IF NOT EXISTS keys (token TEXT PRIMARY KEY, publicKey TEXT)');
        }
    }

    /**
     * Збереження публічного ключа для вказаного токена
     * @param {string} token - Токен
     * @param {string} publicKey - Публічний ключ
     */
    async savePublicKey(token, publicKey) {
        if (this.storageType === 'redis') {
            await this.setAsync(token, publicKey);
        } else if (this.storageType === 'sqlite') {
            const stmt = this.db.prepare('INSERT OR REPLACE INTO keys VALUES (?, ?)');
            stmt.run(token, publicKey);
            stmt.finalize();
        }
    }

    /**
     * Отримання публічного ключа для вказаного токена
     * @param {string} token - Токен
     * @returns {string|null} - Публічний ключ або null, якщо ключ не знайдено
     */
    async getPublicKey(token) {
        if (this.storageType === 'redis') {
            const publicKey = await this.getAsync(token);
            return publicKey || null;
        } else if (this.storageType === 'sqlite') {
            return new Promise((resolve, reject) => {
                this.db.get('SELECT publicKey FROM keys WHERE token = ?', [token], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row ? row.publicKey : null);
                    }
                });
            });
        }
    }
}

module.exports = KeyStorage;