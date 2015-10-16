import React, { PropTypes, Component } from 'react';
import LogMonitorEntry from './LogMonitorEntry';
import LogMonitorButton from './LogMonitorButton';
import shouldPureComponentUpdate from 'react-pure-render/function';
import * as themes from 'redux-devtools-themes';
import { ActionCreators } from 'redux-devtools';
import { updateScrollTop } from './actions';
import reducer from './reducers';

const { reset, rollback, commit, sweep, toggleAction } = ActionCreators;

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
  static reducer = reducer;

  static propTypes = {
    dispatch: PropTypes.func,
    computedStates: PropTypes.array,
    stagedActions: PropTypes.array,
    skippedActions: PropTypes.object,
    monitorState: PropTypes.shape({
      initialScrollTop: PropTypes.number
    }),

    preserveScrollTop: PropTypes.bool,
    select: PropTypes.func.isRequired,
    theme: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string
    ])
  };

  static defaultProps = {
    select: (state) => state,
    theme: 'nicinabox',
    preserveScrollTop: true
  };

  shouldComponentUpdate = shouldPureComponentUpdate;

  constructor(props) {
    super(props);
    this.handleToggleAction = this.handleToggleAction.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleRollback = this.handleRollback.bind(this);
    this.handleSweep = this.handleSweep.bind(this);
    this.handleCommit = this.handleCommit.bind(this);
  }

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
    this.props.dispatch(updateScrollTop(node ? node.scrollTop : 0));
  }

  componentWillReceiveProps(nextProps) {
    const node = this.refs.container;
    if (!node) {
      this.scrollDown = true;
    } else if (
      this.props.stagedActions.length <
      nextProps.stagedActions.length
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
    this.props.dispatch(rollback());
  }

  handleSweep() {
    this.props.dispatch(sweep());
  }

  handleCommit() {
    this.props.dispatch(commit());
  }

  handleToggleAction(index) {
    this.props.dispatch(toggleAction(index));
  }

  handleReset() {
    this.props.dispatch(reset());
  }

  render() {
    const elements = [];
    const { skippedActions, stagedActions, computedStates, select } = this.props;

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
                         onActionClick={this.handleToggleAction} />
      );
    }

    return (
      <div style={{...styles.container, backgroundColor: theme.base00}}>
        <div style={{...styles.buttonBar, borderColor: theme.base02}}>
          <LogMonitorButton
            theme={theme}
            onClick={this.handleReset}
            enabled>
            Reset
          </LogMonitorButton>
          <LogMonitorButton
            theme={theme}
            onClick={this.handleRollback}
            enabled={computedStates.length > 1}>
            Revert
          </LogMonitorButton>
          <LogMonitorButton
            theme={theme}
            onClick={this.handleSweep}
            enabled={Object.keys(skippedActions).some(key => skippedActions[key])}>
            Sweep
          </LogMonitorButton>
          <LogMonitorButton
            theme={theme}
            onClick={this.handleCommit}
            enabled={computedStates.length > 1}>
            Commit
          </LogMonitorButton>
        </div>
        <div style={styles.elements} ref='container'>
          {elements}
        </div>
      </div>
    );
  }
}
