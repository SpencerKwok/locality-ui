import React from "react";
import Cookie from "js-cookie";
import { createBrowserHistory } from "history";
import { Router, Switch, Route } from "react-router-dom";

import { Login, Notifications } from "./components";

const history = createBrowserHistory();

function App() {
  const firstName = Cookie.get("firstName");
  const lastName = Cookie.get("lastName");
  if (!firstName || !lastName) {
    history.push("/login");
  }
  return (
    <Router history={history}>
      <Switch>
        <Route exact path="/">
          <div>
            <h1>Send Notification</h1>
            <Notifications />
          </div>
        </Route>
        <Route exact path="/login">
          <div>
            <h1>Locality</h1>
            <h2>Oh baby, some local information</h2>
            <Login />
          </div>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
