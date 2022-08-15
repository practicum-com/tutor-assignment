const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: 'Error occurred' }));
};

const getCard = (req, res) => {
  const { id } = req.params;
  Card.findById(id)
    .then((card) => res.send({ data: card }))
    .catch(() => res.status(500).send({ message: 'Error occurred' }));
};

const createCard = (req, res) => {
  const { name, image } = req.body;
  Card.create({ name, image })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(404).send({ message: `${Object.values(err.errors).map((error) => error.message).join(', ')}` });
      } else {
        res.status(500).send({ message: 'Error occurred' });
      }
    });
};

const deleteCard = (req, res) => {
  const { id } = req.params;
  Card.findById(id)
    .orFail(() => {
      const error = new Error('Card not found');
      error.statusCode = 404;
      throw error;
    })
    .then((card) => Card.updateOne(card)
      .then(() => res.send({ data: card })))
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        res.status(400).send({ message: 'ID is not valid' });
      } else if (err.statusCode === 404) {
        res.status(404).send({ message: err.message });
      } else {
        res.status(500).send({ message: 'Error occurred' });
      }
    });
};

module.exports = {
  getCards,
  getCard,
  createCard,
  deleteCard
};
