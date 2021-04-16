import React, { lazy, Suspense } from "react";
import queryString from "query-string";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./App.css";
import { Main, Navigation } from "./components";

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
              const About = lazy(() =>
                import("./components").then((module) => ({
                  default: module.About,
                }))
              );
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
              const Contact = lazy(() =>
                import("./components").then((module) => ({
                  default: module.Contact,
                }))
              );
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
              const Extension = lazy(() =>
                import("./components").then((module) => ({
                  default: module.Extension,
                }))
              );
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
              const SignIn = lazy(() =>
                import("./components").then((module) => ({
                  default: module.SignIn,
                }))
              );
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
              const SignUp = lazy(() =>
                import("./components").then((module) => ({
                  default: module.SignUp,
                }))
              );
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
              const Dashboard = lazy(() =>
                import("./components").then((module) => ({
                  default: module.Dashboard,
                }))
              );
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
              const WishList = lazy(() =>
                import("./components").then((module) => ({
                  default: module.WishList,
                }))
              );
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
