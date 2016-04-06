import React, { Component } from 'react';
import JSONTree from 'react-json-tree';

const styles = {
  actionBar: {
    paddingTop: 8,
    paddingBottom: 7,
    paddingLeft: 16
  },
  payload: {
    margin: 0,
    overflow: 'auto'
  },
  tree: {}
};

export default class LogMonitorAction extends Component {

  addDensity(style) {
    const { density } = this.props
    switch(density) {
      case 'compact': {
        style.marginTop = 0
        style.marginBottom = 0
        break
      }
      case 'cozy': {
        style.marginTop = 16
        style.marginBottom = 16
        break
      }
      default: {
        style.marginTop = 8
        style.marginBottom = 8
      }
    }
    return style
  }

  renderPayload(payload) {
    return (
      <div style={{
        ...styles.payload,
        backgroundColor: this.props.theme.base00
      }}>
        { Object.keys(payload).length > 0 ?
          <JSONTree theme={this.props.theme}
                    keyName={'action'}
                    data={payload}
                    expandRoot={this.props.expandActionRoot}
                    style={this.addDensity(styles.tree)} /> : '' }
      </div>
    );
  }

  render() {
    const { type, ...payload } = this.props.action;
    return (
      <div style={{
        backgroundColor: this.props.theme.base02,
        color: this.props.theme.base06,
        ...this.props.style
      }}>
        <div style={styles.actionBar}
          onClick={this.props.onClick}>
          {type}
        </div>
        {!this.props.collapsed ? this.renderPayload(payload) : ''}
      </div>
    );
  }
}
