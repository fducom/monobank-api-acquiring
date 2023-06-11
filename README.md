# monobank-api-acquiring

monobank-api-acquiring - це пакет Node.js, який надає зручний спосіб взаємодії з API Monobank для мерчантів. Цей пакет дозволяє виконувати різноманітні операції, такі як створення рахунків, отримання статусу платежу, видалення карт і багато іншого.

## Встановлення

Встановіть MonoAPI, використовуючи менеджер пакетів npm:

```bash
npm install monobank-api-acquiring
```

## Використання

```javascript
const MonoAPI = require('monobank-api-acquiring');

// Ініціалізація MonoAPI з токеном та шляхом до бази даних
const api = new MonoAPI('YOUR_TOKEN', { storage: 'redis', redisClient: redis.createClient() });
// Або з SQLITE
const api = new MonoAPI('YOUR_TOKEN', { storage: 'sqlite' });


// Використання методів API
api.getInvoiceStatus('p2_9ZgpZVsl3')
  .then(status => {
    console.log('Статус рахунку:', status);
  })
  .catch(error => {
    console.error('Помилка:', error.message);
  });
```

## Доступні методи




### `getInvoiceStatus(invoiceId)`

Отримати статус рахунку за його ідентифікатором.

- `invoiceId` (обов'язковий) - Ідентифікатор рахунку.

Повертає об'єкт зі статусом рахунку або кидає помилку у разі невдалого запиту.

### `createInvoice(invoiceData)`

Створити новий рахунок.

- `invoiceData` (обов'язковий) - Об'єкт з даними рахунку.

Повертає об'єкт з даними створеного рахунку або кидає помилку у разі невдалого запиту.

Робота з токенізованими картами

### `getWallet(walletId)`

### `makePaymentFromWallet(paymentData)`

### `deleteCard(cardToken)`

Видалити токенізовану картку.

- `cardToken` (обов'язковий) - Токен картки.

Повертає об'єкт з результатом видалення або кидає помилку у разі невдалого запиту.

## Налаштування keyStorage

monobank-api-acquiring підтримує кешування та зберігання публічних ключів у базі даних. Можливі два варіанти для зберігання ключів: Redis та SQLite. При

 ініціалізації monobank-api-acquiring ви можете вказати налаштування для `keyStorage`.
ключ оновлюється якщо підпис не проходить перевірку

### Redis

```javascript
const MonoAPI = require('monobank-api-acquiring');
const redis = require('redis');

// Ініціалізація MonoAPI з Redis
const api = new MonoAPI('YOUR_TOKEN', { storageType: 'redis', redisClient:  redis.createClient()  });
```

### SQLite

```javascript
const MonoAPI = require('monobank-api-acquiring');

// Ініціалізація MonoAPI з SQLite
const api = new MonoAPI('YOUR_TOKEN', { storage: 'sqlite', options: { storageType: 'sqlite' } });
```

У випадку Redis, ви маєте передати інстанс Redis-клієнта як параметр `redisClient` у налаштуваннях. У випадку SQLite, буде використано стандартний файл в пакеті storage.db для збереження даних і спрощення процедури

Зауважте, що Redis та SQLite вимагають встановлення відповідних пакетів через npm.

```bash
npm install redis sqlite3
```

## Ліцензія

[MIT](LICENSE)



[Подякувати](https://send.monobank.ua/jar/5FSYADyifF)
