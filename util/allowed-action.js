/**
 * Check the action is allowed or not
 * Priority is as follows,
 *    if allowed set have given, allowed set has
 *    if not allowed set have give, not allowed set doest not have
 * @param action
 * @param allowedSet
 * @param blockedSed
 * @returns {boolean}
 */
module.exports = (action, allowedSet, blockedSed) => {
  if (allowedSet.length > 0) {
    return allowedSet.indexOf(action) > -1;
  }
  if (blockedSed.length > 0) {
    return blockedSed.indexOf(action) < 0;
  }
  return true;
};
