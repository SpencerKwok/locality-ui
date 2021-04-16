import React, { lazy, Suspense } from "react";
import queryString from "query-string";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./App.css";

// Lazy load all modules
const About = React.lazy(() =>
  import("./components").then((module) => ({ default: module.About }))
);
const Contact = React.lazy(() =>
  import("./components").then((module) => ({ default: module.Contact }))
);
const Dashboard = React.lazy(() =>
  import("./components").then((module) => ({ default: module.Dashboard }))
);
const Extension = React.lazy(() =>
  import("./components").then((module) => ({ default: module.Extension }))
);
const Main = React.lazy(() =>
  import("./components").then((module) => ({ default: module.Main }))
);
const Navigation = React.lazy(() =>
  import("./components").then((module) => ({ default: module.Navigation }))
);
const SignIn = React.lazy(() =>
  import("./components").then((module) => ({ default: module.SignIn }))
);
const SignUp = React.lazy(() =>
  import("./components").then((module) => ({ default: module.SignUp }))
);
const WishList = React.lazy(() =>
  import("./components").then((module) => ({ default: module.WishList }))
);

import Window from "./utils/window";

function App() {
  const { width, height } = Window();

  return (
    <Suspense fallback={<div></div>}>
      <Router>
        <Switch>
          <Route
            exact
            path="/about"
            render={(props) => {
              return (
                <React.Fragment>
                  <Navigation width={width} />
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
                  <Navigation width={width} />
                  <Contact width={width} />
                </React.Fragment>
              );
            }}
          ></Route>
          <Route
            exact
            path="/extension"
            render={(props) => {
              return (
                <React.Fragment>
                  <Navigation width={width} />
                  <Extension width={width} />
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
                  <Navigation width={width} />
                  <Main query={params.q} height={height} width={width} />
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
                  <Navigation width={width} />
                  <SignIn width={width} />
                </React.Fragment>
              );
            }}
          />
          <Route
            path="/signup"
            render={(props) => {
              return (
                <React.Fragment>
                  <Navigation width={width} />
                  <SignUp width={width} />
                </React.Fragment>
              );
            }}
          />
          <Route
            path="/dashboard"
            render={(props) => {
              return (
                <React.Fragment>
                  <Navigation width={width} />
                  <Dashboard width={width} height={height} />
                </React.Fragment>
              );
            }}
          />
          <Route
            path="/wishlist"
            render={(props) => {
              return (
                <React.Fragment>
                  <Navigation width={width} />
                  <WishList />
                </React.Fragment>
              );
            }}
          />
          <Route
            path="/*"
            render={(props) => (
              <React.Fragment>
                <Navigation width={width} />
                <Main height={height} width={width} />
              </React.Fragment>
            )}
          />
        </Switch>
      </Router>
    </Suspense>
  );
}

export default App;
