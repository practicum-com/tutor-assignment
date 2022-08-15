const mongoose = require('mongoose');
const validator = require('validator');

const cardsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The name field must be filled'],
    minlength: [2, 'Min length is 2'],
    maxlength: [30, 'Max length is 30'],
    validate: {
      validator: (v) => validator.isAlpha(v),
      message: 'Must be a valid name with letters',
    },
  },
  image: {
    type: String,
    required: [true, 'The image field must be filled'],
    validate: {
      validator: (v) => validator.isURL(v),
      message: 'Must be a valid URL',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

module.exports = mongoose.model('card', cardsSchema);
