const jwt = require('jsonwebtoken');
const bycrypt = require('bcryptjs');

const baseModel = require('../model/user-model');
const to = require('../util/to');

const SECRET = 'SHOOOOO';

class UserController {
  constructor(config) {
    this.User = baseModel({});
    this.config = config;
  }

  async createUser(data) {
    const [err, user] = await to(this.User.findOne({ username: data.username }));
    if (err) return Promise.reject(err);
    if (user) {
      return Promise.reject('User Name Already Exist');
    }
    const salt = await bycrypt.genSalt(10); // generate a salt
    const hash = await bycrypt.hash(data.password, salt); // generate the hash of the password
    data.password = hash;
    return new this.User(data).save(); // save
  }

  async loginUser(data) {
    const [err, user] = await to(this.User.findOne({ username: data.username }, '+password'));
    if (err) return Promise.reject(err);
    if (!user) return Promise.reject('User Not Found');

    const [err2, isMatch] = await to(bycrypt.compare(data.password, user.password));
    if (err2) return Promise.reject(err2);

    if (isMatch) {
      return new Promise((resolve, reject) => {
        const encryptObject = {
          _id: user._doc._id,
          username: user._doc.username,
        };
        jwt.sign(encryptObject, SECRET, { expiresIn: '10h' }, (err3, token) => {
          if (err3) reject(err3);
          delete user.password;
          resolve({ token, user });
        });
      });
    } else {
      return Promise.reject('Invalid Password');
    }
  }

  verifyToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, SECRET, (err, data) => {
        // verify the given token
        if (err) return reject(err);
        resolve(data);
      });
    });
  }
}

module.exports = UserController;
