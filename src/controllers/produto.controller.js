const prisma = require('../lib/prisma');

// GET /produtos
async function listProdutos(req, res) {
  try {
    const produtos = await prisma.produto.findMany({
      include: { tags: { where: { dataSaida: null } } },
      orderBy: { nome: 'asc' },
    });

    const resultado = produtos.map((produto) => ({
      ...produto,
      estoqueTotal: produto.tags.reduce((soma, tag) => soma + tag.quantidade, 0),
      totalPallets: produto.tags.length,
    }));

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar produtos', detalhe: err.message });
  }
}

// GET /produtos/:id
async function getProdutoById(req, res) {
  try {
    const { id } = req.params;

    const produto = await prisma.produto.findUnique({
      where: { id: Number(id) },
      include: { tags: { where: { dataSaida: null }, orderBy: { dataEntrada: 'desc' } } },
    });

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const estoqueTotal = produto.tags.reduce((soma, tag) => soma + tag.quantidade, 0);

    res.json({
      ...produto,
      estoqueTotal,
      totalPallets: produto.tags.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produto', detalhe: err.message });
  }
}

// POST /produtos
async function createProduto(req, res) {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Campo "nome" é obrigatório' });
    }

    const produto = await prisma.produto.create({
      data: { nome, descricao },
    });

    res.status(201).json(produto);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar produto', detalhe: err.message });
  }
}

// PUT /produtos/:id
async function updateProduto(req, res) {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    const produtoExiste = await prisma.produto.findUnique({ where: { id: Number(id) } });
    if (!produtoExiste) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const produto = await prisma.produto.update({
      where: { id: Number(id) },
      data: { nome, descricao },
    });

    res.json(produto);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar produto', detalhe: err.message });
  }
}

module.exports = {
  listProdutos,
  getProdutoById,
  createProduto,
  updateProduto,
};
