const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const Schema = mongoose.Schema;
const createModelByConfig = require('../util/create-model-by-config');

module.exports = (config) => {
  const {name, autoIncrement: {enable, filed, startAt}} = config;

  const schema = new Schema(createModelByConfig(config));

  if(enable) {
    autoIncrement.initialize(mongoose.connection);
    schema.plugin(autoIncrement.plugin, { model: name, field: filed || 'id', startAt: startAt || 0 });
  }

  return mongoose.model(name, schema);
};
