import React, { PropTypes, Component } from 'react';
import JSONTree from 'react-json-tree';
import LogMonitorEntryAction from './LogMonitorEntryAction';
import shouldPureComponentUpdate from 'react-pure-render/function';

const styles = {
  entry: {
    display: 'block',
    WebkitUserSelect: 'none'
  },
  tree: {
    paddingLeft: 0
  }
};

export default class LogMonitorEntry extends Component {
  static propTypes = {
    state: PropTypes.object.isRequired,
    action: PropTypes.object.isRequired,
    actionId: PropTypes.number.isRequired,
    select: PropTypes.func.isRequired,
    density: PropTypes.oneOf(['comfortable',
      'cozy',
      'compact']),
    error: PropTypes.string,
    onActionClick: PropTypes.func.isRequired,
    collapsed: PropTypes.bool,
    expandActionRoot: PropTypes.bool,
    expandStateRoot: PropTypes.bool
  };

  shouldComponentUpdate = shouldPureComponentUpdate;

  constructor(props) {
    super(props);
    this.handleActionClick = this.handleActionClick.bind(this);
  }

  addDensity(style) {
    const { density } = this.props
    switch(density) {
      case 'compact':
        style.marginTop = 0
    }
    return style
  }

  printState(state, error) {
    let errorText = error;
    if (!errorText) {
      try {
        return (
          <JSONTree
            theme={this.props.theme}
            keyPath={['state']}
            data={this.props.select(state)}
            previousData={
              typeof this.props.previousState !== 'undefined' ?
                this.props.select(this.props.previousState) :
                undefined
            }
            expandRoot={this.props.expandStateRoot}
            style={this.addDensity(styles.tree)} />
        );
      } catch (err) {
        errorText = 'Error selecting state.';
      }
    }

    return (
      <div style={{
        color: this.props.theme.base08,
        paddingTop: 20,
        paddingLeft: 30,
        paddingRight: 30,
        paddingBottom: 35
      }}>
        {errorText}
      </div>
    );
  }

  handleActionClick() {
    const { actionId, onActionClick } = this.props;
    if (actionId > 0) {
      onActionClick(actionId);
    }
  }

  render() {
    const { actionId, error, action, state, collapsed } = this.props;
    const styleEntry = {
      opacity: collapsed ? 0.5 : 1,
      cursor: (actionId > 0) ? 'pointer' : 'default'
    };

    return (
      <div style={{
        textDecoration: collapsed ? 'line-through' : 'none',
        color: this.props.theme.base06
      }}>
        <LogMonitorEntryAction
          theme={this.props.theme}
          collapsed={collapsed}
          action={action}
          expandActionRoot={this.props.expandActionRoot}
          onClick={this.handleActionClick}
          density={this.props.density}
          style={{...styles.entry, ...styleEntry}}/>
        {!collapsed &&
          <div>
            {this.printState(state, error)}
          </div>
        }
      </div>
    );
  }
}
