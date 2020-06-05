const baseModel = require('../model/base-model');

class BaseController {

  constructor(config) {
    this.Model = baseModel(config);
    this.config = config;
  }

  create(body) {
    return new this.Model(body).save();
  }

  find(filter, select, populate, sort) {
    return this.Model.find(filter, select, {populate, sort});
  }

  paginate(filter, select, populate, paginateInfo, sort) {
    return this.Model.paginate(filter, {select, populate, sort, ...paginateInfo});
  }

  count(filter) {
    return this.Model.count(filter);
  }

  findOne(filter, select, populate) {
    return this.Model.findOne(filter, select, {populate: populate});
  }

  findById(id, select, populate) {
    return this.Model.findById(id, select, {populate: populate});
  }

  editById(id, newData, options = {}) {
    return this.Model.findByIdAndUpdate(id, newData, {new: true, ...options});
  }

  editOne(query, newData, options) {
    return this.Model.findOneAndUpdate(query, newData, {new: true, ...options});
  }

  removeById(id) {
    return this.Model.findByIdAndRemove(id);
  }

  removeOne(query) {
    return this.Model.findOneAndRemove(query);
  }

  getModel() {
    return this.Model;
  }
}

module.exports = BaseController;
