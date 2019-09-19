const express = require('express');
const AuthController = require('../controller/auth-controller');
const to = require('../util/to');

module.exports = (config) => {
  const router = express.Router();
  const authController = new AuthController(config);
  console.log('auth router');

  router.post('/signup', async (req, res, next) => {
    req.mjsHandled = true;
    [res.mjsError, res.mjsResult] = await to(authController.createUser(req.body));
    next();
  });

  router.post('/login', async (req, res, next) => {
    req.mjsHandled = true;
    [res.mjsError, res.mjsResult] = await to(authController.loginUser(req.body));
    next();
  });

  return router;
};
