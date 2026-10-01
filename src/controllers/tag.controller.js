const prisma = require('../lib/prisma');

// GET /tags
// Por padrão só traz tags ATIVAS (dataSaida = null).
// Use ?incluirInativas=true para trazer também as desativadas (histórico).
// Filtros opcionais: ?produtoId=1&lote=24051201
async function listTags(req, res) {
  try {
    const { produtoId, lote, incluirInativas } = req.query;

    const where = {};
    if (produtoId) where.produtoId = Number(produtoId);
    if (lote) where.lote = lote;
    if (incluirInativas !== 'true') where.dataSaida = null;

    const tags = await prisma.tag.findMany({
      where,
      include: { produto: true },
      orderBy: { dataEntrada: 'desc' },
    });

    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar tags', detalhe: err.message });
  }
}

// GET /tags/:tid
// Busca direta por id, retorna a tag mesmo que esteja desativada.
async function getTagById(req, res) {
  try {
    const { tid } = req.params;

    const tag = await prisma.tag.findUnique({
      where: { id: tid },
      include: { produto: true },
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag não encontrada' });
    }

    res.json(tag);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar tag', detalhe: err.message });
  }
}

// POST /tags
// Registra a entrada de um pallet no estoque.
async function createTag(req, res) {
  try {
    const { id, produtoId, lote, quantidade, dataFabricacao, validade } = req.body;

    if (!id || !produtoId || !lote || !quantidade || !dataFabricacao || !validade) {
      return res.status(400).json({
        error: 'Campos obrigatórios: id, produtoId, lote, quantidade, dataFabricacao, validade',
      });
    }

    const produto = await prisma.produto.findUnique({ where: { id: Number(produtoId) } });
    if (!produto) {
      return res.status(400).json({ error: 'Produto informado não existe' });
    }

    const tagExiste = await prisma.tag.findUnique({ where: { id } });
    if (tagExiste) {
      return res.status(409).json({ error: 'Já existe uma tag com esse TID' });
    }

    const tag = await prisma.$transaction(async (tx) => {
      const novaTag = await tx.tag.create({
        data: {
          id,
          produtoId: Number(produtoId),
          lote,
          quantidade: Number(quantidade),
          dataFabricacao: new Date(dataFabricacao),
          validade: new Date(validade),
        },
      });

      await tx.movimentacao.create({
        data: {
          tipo: 'ENTRADA',
          tagId: novaTag.id,
          produtoId: novaTag.produtoId,
          quantidade: novaTag.quantidade,
          data: novaTag.dataEntrada,
        },
      });

      return novaTag;
    });

    res.status(201).json(tag);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar tag', detalhe: err.message });
  }
}

// PUT /tags/:tid
// Atualiza dados do pallet (não reativa uma tag desativada via essa rota).
async function updateTag(req, res) {
  try {
    const { tid } = req.params;
    const { lote, quantidade, dataFabricacao, validade } = req.body;

    const tagExiste = await prisma.tag.findUnique({ where: { id: tid } });
    if (!tagExiste) {
      return res.status(404).json({ error: 'Tag não encontrada' });
    }

    const tag = await prisma.tag.update({
      where: { id: tid },
      data: {
        lote,
        quantidade: quantidade !== undefined ? Number(quantidade) : undefined,
        dataFabricacao: dataFabricacao ? new Date(dataFabricacao) : undefined,
        validade: validade ? new Date(validade) : undefined,
      },
    });

    res.json(tag);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar tag', detalhe: err.message });
  }
}

// DELETE /tags/:tid
// Registra saída sem remover histórico do pallet.
async function deleteTag(req, res) {
  try {
    const { tid } = req.params;

    const tag = await prisma.tag.findUnique({ where: { id: tid } });
    if (!tag) {
      return res.status(404).json({ error: 'Tag não encontrada' });
    }

    if (tag.dataSaida) {
      return res.status(409).json({ error: 'Tag já possui saída registrada' });
    }

    await prisma.$transaction(async (tx) => {
      const saida = new Date();
      await tx.tag.update({ where: { id: tid }, data: { dataSaida: saida } });
      await tx.movimentacao.create({
        data: {
          tipo: 'SAIDA',
          tagId: tag.id,
          produtoId: tag.produtoId,
          quantidade: tag.quantidade,
          data: saida,
        },
      });
    });

    res.json({ message: 'Saída registrada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover tag', detalhe: err.message });
  }
}

module.exports = {
  listTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
};
