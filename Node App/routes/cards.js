const router = require('express').Router();

const {
  createCard,
  getCards,
  getCard,
  deleteCard,
} = require('../controllers/cards');

router.get('/', getCards);
router.get('/:id', getCard);
router.post('/', createCard);
router.delete('/:id', deleteCard);

module.exports = router;
