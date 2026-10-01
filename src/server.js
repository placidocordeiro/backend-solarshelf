require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { verifyToken } = require('./lib/auth');
const authRoutes = require('./routes/auth.routes');
const produtoRoutes = require('./routes/produto.routes');
const tagRoutes = require('./routes/tag.routes');
const movimentacaoRoutes = require('./routes/movimentacao.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/produtos', verifyToken, produtoRoutes);
app.use('/tags', verifyToken, tagRoutes);
app.use('/movimentacoes', verifyToken, movimentacaoRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'rfid-estoque-backend' });
});

// handler simples de erros não tratados
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno', detalhe: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
