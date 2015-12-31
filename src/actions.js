const UPDATE_SCROLL_TOP = '@@redux-devtools-log-monitor/UPDATE_SCROLL_TOP';
function updateScrollTop(scrollTop) {
  return { type: UPDATE_SCROLL_TOP, scrollTop };
}

module.exports = {
  UPDATE_SCROLL_TOP,
  updateScrollTop
};
