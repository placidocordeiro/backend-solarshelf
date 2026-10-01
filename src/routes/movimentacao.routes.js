const { Router } = require('express');
const { listMovimentacoes } = require('../controllers/movimentacao.controller');

const router = Router();
router.get('/', listMovimentacoes);

module.exports = router;
