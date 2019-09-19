module.exports = (config) => {
  return {
    apiVersion: config.apiVersion || 'v1',
    routePrefix: config.routePrefix || 'api',
    enableCors: config.enableCors !== false,
    auth: {
      enableAuth: config.enableAuth || false,
    },
    models: config.models.map(m => {
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
      }
    }),
  }
};
