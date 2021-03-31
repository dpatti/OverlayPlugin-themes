import React from "react";
import ReactDOM from "react-dom";

import Meters from "./meters";
import Timers from "./timers";

const App = /\?timers/.test(document.location.search) ? Timers : Meters;

ReactDOM.render(React.createElement(App, {}), document.getElementById("app"));
