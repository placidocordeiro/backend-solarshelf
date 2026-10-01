const { Router } = require('express');
const {
  listProdutos,
  getProdutoById,
  createProduto,
  updateProduto,
} = require('../controllers/produto.controller');

const router = Router();

router.get('/', listProdutos);
router.get('/:id', getProdutoById);
router.post('/', createProduto);
router.put('/:id', updateProduto);

module.exports = router;
