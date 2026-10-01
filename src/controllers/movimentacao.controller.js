const prisma = require('../lib/prisma');

async function listMovimentacoes(req, res) {
  try {
    const { produtoId, tipo, de, ate } = req.query;
    const where = {};

    if (produtoId) where.produtoId = Number(produtoId);
    if (tipo === 'ENTRADA' || tipo === 'SAIDA') where.tipo = tipo;
    if (de || ate) {
      where.data = {};
      if (de) where.data.gte = new Date(`${de}T00:00:00`);
      if (ate) where.data.lte = new Date(`${ate}T23:59:59.999`);
    }

    const movimentacoes = await prisma.movimentacao.findMany({
      where,
      include: { produto: true, tag: true },
      orderBy: { data: 'desc' },
    });

    res.json(movimentacoes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar movimentações', detalhe: err.message });
  }
}

module.exports = { listMovimentacoes };
