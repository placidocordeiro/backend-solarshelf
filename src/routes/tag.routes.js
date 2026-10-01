const { Router } = require('express');
const {
  listTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} = require('../controllers/tag.controller');

const router = Router();

router.get('/', listTags);
router.get('/:tid', getTagById);
router.post('/', createTag);
router.put('/:tid', updateTag);
router.delete('/:tid', deleteTag);

module.exports = router;
