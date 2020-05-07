module.exports = (config) => {
  return {
    dbName: config.dbName || 'mjs-api-db',
    apiVersion: config.apiVersion || 'v1',
    routePrefix: config.routePrefix || 'api',
    enableCors: config.enableCors !== false,
    auth: {
      adminKey: (config.auth && config.auth.adminKey) || null,
      enableAuth: (config.auth && config.auth.enable) || false,
      shape: (config.auth && config.auth.shape) || {},
      tokenExpiresIn: (config.auth && config.auth.tokenExpiresIn) || '1d',
    },
    models: config.models.map((m) => {
      return {
        name: m.name,
        path: m.path || m.name.lowerCase(),
        autoIncrement: {
          enable: m.autoIncrement && m.autoIncrement.enable,
          field: m.autoIncrement && m.autoIncrement.field,
          startAt: m.autoIncrement && m.autoIncrement.startAt,
        },
        checkUsageBeforeDelete: m.checkUsageBeforeDelete,
        timestamps: m.timestamps,
        shape: m.shape,
        mongooseOriginalSchema: m.mongooseOriginalSchema || false,
        uniqueKeys: m.uniqueKeys || false,
        blockedActionByRole: m.blockedActionByRole || {},
        allowedActionByRole: m.allowedActionByRole || {},
        allowedActions: m.allowedActions || [],
        blockedActions: m.blockedActions || [],
        privateActions: m.privateActions || [],
        allPrivate: m.allPrivate || false,
        createValidator: m.createValidator || false,
        additionalRoutes:
          m.additionalRoutes &&
          m.additionalRoutes.map((x) => {
            if (x.method && x.pathPattern && x.actionName && x.handler) {
              return { ...x };
            } else {
              throw 'invalid additionalRoutes Object';
            }
          }),
      };
    }),
  };
};
