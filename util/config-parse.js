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
        shape: m.shape,
        allowedActions: m.allowedActions || [],
        notAllowedActions: m.notAllowedActions || [],
        privateActions: m.privateActions || [],
        allPrivate: m.allPrivate || false,
        createValidator: m.createValidator || false,
      };
    }),
  };
};
