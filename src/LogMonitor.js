import React, { PropTypes, Component } from 'react';
import LogMonitorEntry from './LogMonitorEntry';
import LogMonitorButton from './LogMonitorButton';
import { combineReducers } from 'redux';
import * as themes from 'redux-devtools-themes';

const styles = {
  container: {
    fontFamily: 'monaco, Consolas, Lucida Console, monospace',
    position: 'relative',
    overflowY: 'hidden',
    width: '100%',
    height: '100%',
    minWidth: 300
  },
  buttonBar: {
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderColor: 'transparent',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'row'
  },
  elements: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 38,
    bottom: 0,
    overflowX: 'hidden',
    overflowY: 'auto'
  }
};

export default class LogMonitor extends Component {
  static propTypes = {
    preserveScrollTop: PropTypes.bool,
    select: PropTypes.func.isRequired,
    theme: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string
    ]),

    monitorState: PropTypes.shape({
      initialScrollTop: PropTypes.number.isRequired
    }),

    monitorActions: PropTypes.shape({
      updateScrollTop: PropTypes.func.isRequired
    }),

    historyState: PropTypes.shape({
      computedStates: PropTypes.array.isRequired,
      currentStateIndex: PropTypes.number.isRequired,
      stagedActions: PropTypes.array.isRequired,
      skippedActions: PropTypes.object.isRequired
    }),

    historyActions: PropTypes.shape({
      reset: PropTypes.func.isRequired,
      commit: PropTypes.func.isRequired,
      rollback: PropTypes.func.isRequired,
      sweep: PropTypes.func.isRequired,
      toggleAction: PropTypes.func.isRequired
    })
  };

  static defaultProps = {
    select: (state) => state,
    theme: 'nicinabox',
    preserveScrollTop: true
  };

  componentDidMount() {
    const node = this.refs.container;
    if (!node) {
      return;
    }

    node.scrollTop = this.props.monitorState.initialScrollTop;
    this.interval = setInterval(::this.updateScrollTop, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.setInterval);
  }

  updateScrollTop() {
    const node = this.refs.container;
    this.props.monitorActions.updateScrollTop(node ? node.scrollTop : 0);
  }

  componentWillReceiveProps(nextProps) {
    const node = this.refs.container;
    if (!node) {
      this.scrollDown = true;
    } else if (
      this.props.historyState.stagedActions.length <
      nextProps.historyState.stagedActions.length
    ) {
      const { scrollTop, offsetHeight, scrollHeight } = node;

      this.scrollDown = Math.abs(
        scrollHeight - (scrollTop + offsetHeight)
      ) < 20;
    } else {
      this.scrollDown = false;
    }
  }

  componentDidUpdate() {
    const node = this.refs.container;
    if (!node) {
      return;
    }
    if (this.scrollDown) {
      const { offsetHeight, scrollHeight } = node;
      node.scrollTop = scrollHeight - offsetHeight;
      this.scrollDown = false;
    }
  }

  handleRollback() {
    this.props.historyActions.rollback();
  }

  handleSweep() {
    this.props.historyActions.sweep();
  }

  handleCommit() {
    this.props.historyActions.commit();
  }

  handleToggleAction(index) {
    this.props.historyActions.toggleAction(index);
  }

  handleReset() {
    this.props.historyActions.reset();
  }

  render() {
    const elements = [];
    const { historyState, select } = this.props;
    // const { isVisible } = monitorState;
    const { skippedActions, stagedActions, computedStates } = historyState;

    let theme;
    if (typeof this.props.theme === 'string') {
      if (typeof themes[this.props.theme] !== 'undefined') {
        theme = themes[this.props.theme];
      } else {
        console.warn('DevTools theme ' + this.props.theme + ' not found, defaulting to nicinabox');
        theme = themes.nicinabox;
      }
    } else {
      theme = this.props.theme;
    }

    for (let i = 0; i < stagedActions.length; i++) {
      const action = stagedActions[i];
      const { state, error } = computedStates[i];
      let previousState;
      if (i > 0) {
        previousState = computedStates[i - 1].state;
      }
      elements.push(
        <LogMonitorEntry key={i}
                         index={i}
                         theme={theme}
                         select={select}
                         action={action}
                         state={state}
                         previousState={previousState}
                         collapsed={skippedActions[i]}
                         error={error}
                         onActionClick={::this.handleToggleAction} />
      );
    }

    return (
      <div style={{...styles.container, backgroundColor: theme.base00}}>
        <div style={{...styles.buttonBar, borderColor: theme.base02}}>
          <LogMonitorButton theme={theme} onClick={::this.handleReset}>Reset</LogMonitorButton>
          <LogMonitorButton theme={theme} onClick={::this.handleRollback} enabled={computedStates.length}>Revert</LogMonitorButton>
          <LogMonitorButton theme={theme} onClick={::this.handleSweep} enabled={Object.keys(skippedActions).some(key => skippedActions[key])}>Sweep</LogMonitorButton>
          <LogMonitorButton theme={theme} onClick={::this.handleCommit} enabled={computedStates.length > 1}>Commit</LogMonitorButton>
        </div>
        <div style={styles.elements} ref='container'>
          {elements}
        </div>
      </div>
    );
  }
}

const UPDATE_SCROLL_TOP = '@@redux-devtools-log-monitor/UPDATE_SCROLL_TOP';
function updateScrollTop(scrollTop) {
  return { type: UPDATE_SCROLL_TOP, scrollTop };
}

LogMonitor.setup = function setup(props) {
  function initialScrollTop(state = 0, action) {
    if (!props.preserveScrollTop) {
      return 0;
    }

    return action.type === UPDATE_SCROLL_TOP ?
      action.scrollTop :
      state;
  }

  const reducer = combineReducers({ initialScrollTop });
  const actionCreators = { updateScrollTop };

  return { reducer, actionCreators };
};
