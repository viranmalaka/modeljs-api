const baseModel = require('../model/base-model');

class BaseController {

  constructor(config) {
    this.Model = baseModel(config);
    this.config = config;
  }

  create(body) {
    return new this.Model(body).save();
  }

  find(filter, select, populate) {
    return this.Model.find(filter, select, {populate: populate});
  }

  findOne(filter, select, populate) {
    return this.Model.findOne(filter, select, {populate: populate});
  }

  findById(id, select, populate) {
    return this.Model.findById(id, select, {populate: populate});
  }

  editById(id, newData) {
    return this.Model.findByIdAndUpdate(id, newData);
  }

  editOne(query, newData) {
    return this.Model.findOneAndUpdate(query, newData);
  }

  removeById(id) {
    return this.Model.findByIdAndRemove(id);
  }

  removeOne(query) {
    return this.Model.findOneAndRemove(query);
  }
}

module.exports = BaseController;
