const { UPDATE_SCROLL_TOP } = require('./actions');

function initialScrollTop(props, state = 0, action) {
  if (!props.preserveScrollTop) {
    return 0;
  }

  return action.type === UPDATE_SCROLL_TOP ?
    action.scrollTop :
    state;
}

module.exports = function reducer(props, state = {}, action) {
  return {
    initialScrollTop: initialScrollTop(props, state.initialScrollTop, action)
  };
};
