const mongoose = require('mongoose');

module.exports = (name, done) => {
  return mongoose.connect(`mongodb://localhost/${name}`, () => {
    mongoose.connection.db.dropDatabase(() => {
      console.log('clear db', name);
      done();
    });
  });
};
