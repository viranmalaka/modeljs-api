const express = require('express');
const AuthController = require('../controller/auth-controller');
const to = require('../util/to');
let authController = null;

const authRouter = (authConfigs, signUpHook, metaExport) => {
  const router = express.Router();
  authController = new AuthController(authConfigs);
  metaExport.User = authController.User;

  const defaultHook = (req, res, next) => {
    next();
  };

  router.post('/signup', signUpHook || defaultHook, async (req, res, next) => {
    req.mjsHandled = true;

    const goNext = async () => {
      [res.mjsError, res.mjsResult] = await to(authController.createUser(req.body));
      if (res.mjsResult) {
        res.mjsResult.password = undefined;
      }
      return next();
    };

    if(req.body.userRole < 0) {
      if (req.get('adminKey') === authConfigs.adminKey ) { // with adminKey can create admins
        return goNext();
      } else if (req.isAuthenticated && req.user.userRole < 0) { // another admin can create admins
        return goNext();
      }
      if (req.get('adminKey') !== authConfigs.adminKey || (req.user && req.user.userRole >= 0)) {
        res.mjsError = { message: 'No Permission to create Admin' };
        res.mjsResStatus = 401;
        return next();
      }
    } else {
      return goNext();
    }
  });

  router.post('/login', async (req, res, next) => {
    req.mjsHandled = true;
    [res.mjsError, res.mjsResult] = await to(authController.loginUser(req.body));
    next();
  });

  router.get('/who', (req, res, next) => {
    req.mjsHandled = true;
    res.mjsResult = req.isAuthenticated ? req.user : null;
    res.mjsResStatus = req.isAuthenticated ? 200 : 401;
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
