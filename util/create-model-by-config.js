const mongoose = require('mongoose');

const getType = (type) => {
  if (typeof type !== 'string') {
    if (type && type.ref && typeof type.ref === 'string') {
      return  mongoose.Schema.Types.ObjectId;
    }
    return type;
  }
  switch (type) {
    case 'string':
      return String;
    case 'number':
      return Number;
  }
};

module.exports = (config) => {
  const shape = config.shape;
  const obj = {};

  Object.keys(shape).forEach(key => {
    const data = shape[key];

    obj[key] = {
      type: getType(data.type),
      required: data.required || false,
    };

    if (data.type && data.type.ref && typeof data.type.ref === 'string') {
      obj[key].ref = data.type.ref;
    }

    if (data.validate) {
      obj[key].validate = data.validate;
    }
  });

  return obj;
};
