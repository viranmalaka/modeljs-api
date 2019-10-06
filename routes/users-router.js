const express = require('express');
const AuthController = require('../controller/auth-controller');
const to = require('../util/to');
let authController = null;

const authRouter = (authConfigs) => {
  const router = express.Router();
  authController = new AuthController(authConfigs);

  router.post('/signup', async (req, res, next) => {
    req.mjsHandled = true;
    [res.mjsError, res.mjsResult] = await to(authController.createUser(req.body));
    if (res.mjsResult) {
      res.mjsResult.password = undefined;
    }
    next();
  });

  router.post('/login', async (req, res, next) => {
    req.mjsHandled = true;
    [res.mjsError, res.mjsResult] = await to(authController.loginUser(req.body));
    next();
  });

  return router;
};

const authMiddleware = async (req, res, next) => {
  const token = req.get('token'); // get the token data from the header
  if (token) {
    const [err, user] = await to(authController.verifyToken(token));
    if (err) {
      req.isAuthenticated = false;
      req.user = null;
    } else {
      req.isAuthenticated = true;
      req.user = user;
    }
  } else {
    res.mjsError = { message: 'No Token Found' };
  }
  next();
};

module.exports = {
  authMiddleware,
  authRouter,
};
