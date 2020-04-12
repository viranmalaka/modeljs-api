module.exports = {
  info: (msg, payload) => {
    console.log(`[INFO] [${new Date(Date.now())}] ${msg} ${payload ? '\n\t' + JSON.stringify(payload) : ''}`);
  },
  error: (msg, payload) => {
    console.log(`[!ERROR!] [${new Date(Date.now())}] ${msg} ${payload ? '\n\t' + JSON.stringify(payload) : ''}`);
  }
};
