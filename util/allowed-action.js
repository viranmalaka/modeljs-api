/**
 * Check the action is allowed or not
 * Priority is as follows,
 *    if allowed set have given, allowed set has
 *    if not allowed set have give, not allowed set doest not have
 * @param action
 * @param allowedSet
 * @param blockedSet
 * @returns {boolean}
 */
module.exports = (action, allowedSet = [], blockedSet = []) => {
  if (allowedSet.length > 0) {
    return allowedSet.indexOf(action) > -1;
  }
  if (blockedSet.length > 0) {
    return blockedSet.indexOf(action) < 0;
  }
  return true;
};
