Redux DevTools Log Monitor
=========================

The default monitor for [Redux DevTools](https://github.com/gaearon/redux-devtools).  
It shows a log of states and actions, and lets you change their history.

![](http://i.imgur.com/J4GeW0M.gif)

### Installation

```
npm install --save-dev redux-devtools-log-monitor
```

### Usage

You can use `LogMonitor` as the only monitor in your app:

##### `containers/DevTools.js`

```js
import React from 'react';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';

export default createDevTools(
  <LogMonitor />
);
```

Then you can render `<DevTools>` to any place inside app or even into a separate popup window.

Alternative, you can use it together with [`DockMonitor`](https://github.com/gaearon/redux-devtools-dock-monitor) to make it dockable.  
Consult the [`DockMonitor` README](https://github.com/gaearon/redux-devtools-dock-monitor) for details of this approach.

[Read how to start using Redux DevTools.](https://github.com/gaearon/redux-devtools)


### Props

Name                  | Description
-------------         | -------------
`theme`               | Either a string referring to one of the themes provided by [redux-devtools-themes](https://github.com/gaearon/redux-devtools-themes) (feel free to contribute!) or a custom object of the same format. Optional. By default, set to [`'nicinabox'`](https://github.com/gaearon/redux-devtools-themes/blob/master/src/nicinabox.js).
`select`              | A function that selects the slice of the state for DevTools to show. For example, `state => state.thePart.iCare.about`. Optional. By default, set to `state => state`.
`preserveScrollTop`   | When `true`, records the current scroll top every second so it can be restored on refresh. This only has effect when used together with `persistState()` enhancer from Redux DevTools. By default, set to `true`.

### License

MIT
