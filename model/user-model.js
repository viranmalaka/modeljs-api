const createModelByConfig = require('../util/create-model-by-config');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const Schema = mongoose.Schema;

module.exports = (config) => {
  const schema = new Schema(createModelByConfig({
    shape: {
      username: {
        type: String,
        require: true,
        unique: true,
      },
      password: {
        type: String,
        require: true,
        select: false,
      },
      ...config.shape
    }
  }));

  return mongoose.model('User', schema);
};
