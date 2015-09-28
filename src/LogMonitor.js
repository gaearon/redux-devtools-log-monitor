import React, { PropTypes, Component } from 'react';
import { ActionCreators } from 'redux-devtools';
import LogMonitorEntry from './LogMonitorEntry';
import LogMonitorButton from './LogMonitorButton';
import { combineReducers, bindActionCreators } from 'redux';
import * as themes from 'redux-devtools-themes';
import { connect } from 'react-redux';

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

class LogMonitor extends Component {
  static propTypes = {
    monitorState: PropTypes.shape({
      initialScrollTop: PropTypes.number.isRequired
    }).isRequired,

    monitorActions: PropTypes.shape({
      updateScrollTop: PropTypes.func.isRequired
    }).isRequired,

    devToolsState: PropTypes.shape({
      computedStates: PropTypes.array.isRequired,
      currentStateIndex: PropTypes.number.isRequired,
      stagedActions: PropTypes.array.isRequired,
      skippedActions: PropTypes.object.isRequired
    }).isRequired,

    devToolsActions: PropTypes.shape({
      reset: PropTypes.func.isRequired,
      commit: PropTypes.func.isRequired,
      rollback: PropTypes.func.isRequired,
      sweep: PropTypes.func.isRequired,
      toggleAction: PropTypes.func.isRequired
    }).isRequired,

    select: PropTypes.func.isRequired,
    theme: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string
    ])
  };

  static defaultProps = {
    select: (state) => state,
    theme: 'nicinabox'
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
      this.props.devToolsState.stagedActions.length <
      nextProps.devToolsState.stagedActions.length
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
    this.props.devToolsActions.rollback();
  }

  handleSweep() {
    this.props.devToolsActions.sweep();
  }

  handleCommit() {
    this.props.devToolsActions.commit();
  }

  handleToggleAction(index) {
    this.props.devToolsActions.toggleAction(index);
  }

  handleReset() {
    this.props.devToolsActions.reset();
  }

  render() {
    const elements = [];
    const { devToolsState, select } = this.props;
    // const { isVisible } = monitorState;
    const { skippedActions, stagedActions, computedStates } = devToolsState;

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

export default function create({ preserveScrollTop = true } = {}) {
  function initialScrollTop(state = 0, action) {
    if (!preserveScrollTop) {
      return 0;
    }

    return action.type === UPDATE_SCROLL_TOP ?
      action.scrollTop :
      state;
  }

  const Monitor = connect(
    state => state,
    dispatch => ({
      monitorActions: bindActionCreators({ updateScrollTop }, dispatch),
      devToolsActions: bindActionCreators(ActionCreators, dispatch)
    })
  )(LogMonitor);

  Monitor.reducer = combineReducers({
    initialScrollTop
  });

  return Monitor;
}
