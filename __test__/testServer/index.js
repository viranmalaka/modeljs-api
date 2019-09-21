const express = require('express');
const cookieParser = require('cookie-parser');

const modelJS = require('../../index');
const defaultConfig = require('./config');
const defaultHooks = require('./hooks');


module.exports = (config = defaultConfig, hooks = defaultConfig) => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  modelJS(app, config, hooks);

// catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next({message: 'Not Found', status: 404});
  });

// error handler
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.jsonp(err);
  });
  return app;
};
