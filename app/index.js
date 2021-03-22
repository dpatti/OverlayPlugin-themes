import React from "react";
import ReactDOM from "react-dom";

import Meters from "./meters.jsx";
import Timers from "./timers.jsx";

const App = /\?timers/.test(document.location.search) ? Timers : Meters;

ReactDOM.render(React.createElement(App, {}), document.getElementById("app"));
