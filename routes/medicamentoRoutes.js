const express = require('express');
const db = require('../config/db');

const router = express.Router();

const ERROS_CONEXAO = [
  'ECONNREFUSED',
  'ER_ACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR',
  'PROTOCOL_CONNECTION_LOST',
  'ETIMEDOUT'
];

function erroBanco(res, err, mensagem) {
  console.error(err);
  const conexao = ERROS_CONEXAO.includes(err.code);
  return res.status(conexao ? 503 : 500).json({
    erro: conexao ? 'Falha na conexão com o banco de dados' : mensagem,
    codigo: err.code
  });
}

function idValido(id) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
}

function validar(body) {
  const { nome, laboratorio, preco } = body || {};
  const erros = [];
  if (typeof nome !== 'string' || !nome.trim()) erros.push('nome é obrigatório');
  if (typeof laboratorio !== 'string' || !laboratorio.trim()) erros.push('laboratorio é obrigatório');
  if (typeof preco !== 'number' || !Number.isFinite(preco) || preco < 0) {
    erros.push('preco deve ser um número maior ou igual a zero');
  }
  return erros;
}

const formatar = (m) => ({ ...m, preco: Number(m.preco) });

router.get('/', (req, res) => {
  db.query('SELECT id, nome, laboratorio, preco FROM medicamento ORDER BY id', (err, rows) => {
    if (err) return erroBanco(res, err, 'Erro ao listar medicamentos');
    res.status(200).json(rows.map(formatar));
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ erro: 'ID inválido' });

  db.query('SELECT id, nome, laboratorio, preco FROM medicamento WHERE id = ?', [id], (err, rows) => {
    if (err) return erroBanco(res, err, 'Erro ao buscar medicamento');
    if (rows.length === 0) return res.status(404).json({ erro: 'Medicamento não encontrado' });
    res.status(200).json(formatar(rows[0]));
  });
});

router.post('/', (req, res) => {
  const erros = validar(req.body);
  if (erros.length) return res.status(400).json({ erro: 'Dados inválidos', detalhes: erros });

  const nome = req.body.nome.trim();
  const laboratorio = req.body.laboratorio.trim();
  const { preco } = req.body;

  db.query(
    'INSERT INTO medicamento (nome, laboratorio, preco) VALUES (?, ?, ?)',
    [nome, laboratorio, preco],
    (err, result) => {
      if (err) return erroBanco(res, err, 'Erro ao cadastrar medicamento');
      res.status(201).json({ id: result.insertId, nome, laboratorio, preco });
    }
  );
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ erro: 'ID inválido' });

  const erros = validar(req.body);
  if (erros.length) return res.status(400).json({ erro: 'Dados inválidos', detalhes: erros });

  const nome = req.body.nome.trim();
  const laboratorio = req.body.laboratorio.trim();
  const { preco } = req.body;

  db.query(
    'UPDATE medicamento SET nome = ?, laboratorio = ?, preco = ? WHERE id = ?',
    [nome, laboratorio, preco, id],
    (err, result) => {
      if (err) return erroBanco(res, err, 'Erro ao atualizar medicamento');
      if (result.affectedRows === 0) return res.status(404).json({ erro: 'Medicamento não encontrado' });
      res.status(200).json({ id: Number(id), nome, laboratorio, preco });
    }
  );
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ erro: 'ID inválido' });

  db.query('DELETE FROM medicamento WHERE id = ?', [id], (err, result) => {
    if (err) return erroBanco(res, err, 'Erro ao excluir medicamento');
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Medicamento não encontrado' });
    res.status(200).json({ mensagem: 'Medicamento excluído com sucesso', id: Number(id) });
  });
});

module.exports = router;