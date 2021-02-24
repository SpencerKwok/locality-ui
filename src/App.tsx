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
  SignUp,
} from "./components";
import Window from "./utils/window";

function App() {
  const { width, height } = Window();

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
                <About width={width} />
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
                <Contact width={width} />
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
                <Demo width={width} />
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
                <Main width={width} query={params.q} />
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
                <SignIn width={width} />
              </React.Fragment>
            );
          }}
        />
        <Route
          exact
          path="/signup"
          render={(props) => {
            return (
              <React.Fragment>
                <Navigation />
                <SignUp width={width} />
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
                <Dashboard width={width} height={height} />
              </React.Fragment>
            );
          }}
        />
        <Route
          path="/"
          render={(props) => (
            <React.Fragment>
              <Navigation />
              <Main width={width} />
            </React.Fragment>
          )}
        />
      </Switch>
    </Router>
  );
}

export default App;
