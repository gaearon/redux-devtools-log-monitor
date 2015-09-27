import { TOGGLE_VISIBILITY } from './actions';
import { combineReducers } from 'redux';

export default function createMonitorReducer({ isVisibleOnLoad = true } = {}) {
  function isVisible(state = isVisibleOnLoad, action) {
    switch (action.type) {
    case TOGGLE_VISIBILITY:
      return !state;
    default:
      return state;
    }
  }

  return combineReducers({ isVisible });
}
