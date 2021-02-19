import React from "react";
import queryString from "query-string";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import {
  About,
  Contact,
  Dashboard,
  Demo,
  Main,
  Navigation,
  SignIn,
} from "./components";

function App() {
  return (
    <Router>
      <Switch>
        <Route
          exact
          path="/about"
          render={(props) => {
            return (
              <React.Fragment>
                <Navigation />
                <About />
              </React.Fragment>
            );
          }}
        ></Route>
        <Route
          exact
          path="/contact"
          render={(props) => {
            return (
              <React.Fragment>
                <Navigation />
                <Contact />
              </React.Fragment>
            );
          }}
        ></Route>
        <Route
          exact
          path="/demo"
          render={(props) => {
            return (
              <React.Fragment>
                <Navigation />
                <Demo />
              </React.Fragment>
            );
          }}
        ></Route>
        <Route
          exact
          path="/search"
          render={(props) => {
            const params = queryString.parse(props.location.search);
            return (
              <React.Fragment>
                <Navigation />
                <Main query={params.q} />
              </React.Fragment>
            );
          }}
        />
        <Route
          exact
          path="/signin"
          render={(props) => {
            return (
              <React.Fragment>
                <Navigation />
                <SignIn />
              </React.Fragment>
            );
          }}
        />
        <Route
          exact
          path="/dashboard"
          render={(props) => {
            return (
              <React.Fragment>
                <Navigation />
                <Dashboard />
              </React.Fragment>
            );
          }}
        />
        <Route
          path="/"
          render={(props) => (
            <React.Fragment>
              <Navigation />
              <Main />
            </React.Fragment>
          )}
        />
      </Switch>
    </Router>
  );
}

export default App;
