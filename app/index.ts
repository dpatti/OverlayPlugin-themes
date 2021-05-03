import React from "react";
import ReactDOM from "react-dom";

import Meters from "./meters";
import Timers from "./timers";

import { Dict, parseQuery } from "./util";

interface App<T> extends React.ComponentClass<{ env: T }> {
  env(query: Dict): T;
}

const query = parseQuery();
const runApp = <T>(App: App<T>): void => {
  const env = App.env(query);
  ReactDOM.render(
    React.createElement(App, { env }),
    document.getElementById("app")
  );
};

if ("timers" in query) {
  runApp(Timers);
} else {
  runApp(Meters);
}
