const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 3000;

db.getConnection((err, connection) => {
  if (err) {
    console.error('Não foi possível conectar ao banco:', err.code, '-', err.message);
  } else {
    console.log('Conectado ao banco de dados farmacia');
    connection.release();
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});