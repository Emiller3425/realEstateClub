// fetch-test.js
const fetch = require('node-fetch');

const url = 'http://localhost:5005/webhook';
const data = { key: 'value' };

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
})
  .then((response) => response.json())
  .then((json) => console.log(json))
  .catch((error) => console.error('Error:', error));