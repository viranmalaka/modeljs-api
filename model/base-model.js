const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const createModelByConfig = require('../util/create-model-by-config');

module.exports = (config) => {
  const {
    name,
    autoIncrement: { enable, filed, startAt },
    timestamps,
    uniqueKeys,
  } = config;

  const schema = new Schema(createModelByConfig(config), { timestamps });

  if (enable) {
    autoIncrement.initialize(mongoose.connection);
    schema.plugin(autoIncrement.plugin, { model: name, field: filed || 'id', startAt: startAt || 0 });
  }

  if (uniqueKeys) {
    schema.index(uniqueKeys, { unique: true });
  }

  schema.plugin(mongoosePaginate);

  return mongoose.model(name, schema);
};
