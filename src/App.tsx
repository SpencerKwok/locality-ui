import React from "react";
import queryString from "query-string";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Main } from "./components";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/:store/:id"></Route>
        <Route
          exact
          path="/search"
          render={(props) => {
            const params = queryString.parse(props.location.search);
            return <Main query={params.q} />;
          }}
        />
        <Route exact path="/:store"></Route>
        <Route path="/" render={(props) => <Main />} />
      </Switch>
    </Router>
  );
}

export default App;
