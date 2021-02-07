import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Main } from "./components";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/:store/:id"></Route>
        <Route exact path="/:store"></Route>
        <Route path="/">
          <Main />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
