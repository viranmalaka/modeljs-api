module.exports = (action, allowedSet, notAllowedSet) => {
  if (allowedSet.length > 0) {
    return allowedSet.indexOf(action) > -1;
  }
  if (notAllowedSet.length > 0) {
    return notAllowedSet.indexOf(action) < 0;
  }
  return true;
};
