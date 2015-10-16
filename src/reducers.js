import { UPDATE_SCROLL_TOP } from './actions';

function initialScrollTop(state = 0, action, props) {
  if (!props.preserveScrollTop) {
    return 0;
  }

  return action.type === UPDATE_SCROLL_TOP ?
    action.scrollTop :
    state;
}

export default function reducer(state = {}, action, props) {
  return {
    initialScrollTop: initialScrollTop(state.initialScrollTop, action, props)
  };
}
