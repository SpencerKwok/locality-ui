import React from "react";
import Cookie from "js-cookie";
import { Tabs, Tab } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useHistory,
  useRouteMatch,
} from "react-router-dom";

import Account from "./Account/Account";
import Company from "./Company/Company";
import Inventory from "./Inventory/Inventory";

type ActiveTab = "inventory" | "company" | "account";

interface DashboardProps extends React.HTMLProps<HTMLDivElement> {
  height: number;
  width: number;
  activeTab?: ActiveTab;
}

function Dashboard(props: DashboardProps) {
  const companyId = Cookie.get("companyId");
  if (!companyId) {
    return <Redirect to="/signin" />;
  }

  const history = useHistory();
  return (
    <div style={{ padding: "12px 0px 0px 12px" }}>
      <Tabs
        defaultActiveKey={props.activeTab}
        onSelect={(key) => history.replace(`/dashboard/${key}`)}
      >
        <Tab eventKey="inventory" title="Inventory">
          <Inventory width={props.width} height={props.height} />
        </Tab>
        <Tab eventKey="company" title="Company">
          <Company width={props.width} height={props.height} />
        </Tab>
        <Tab eventKey="account" title="Account">
          <Account />
        </Tab>
      </Tabs>
    </div>
  );
}

export interface DashboardRouterProps extends DashboardProps {}

function DashboardRouter(props: DashboardRouterProps) {
  const { path } = useRouteMatch();

  return (
    <Router>
      <Switch>
        {(["inventory", "company", "account"] as Array<ActiveTab>).map((p) => (
          <Route
            exact
            path={`${path}/${p}`}
            children={<Dashboard {...props} activeTab={p} />}
          />
        ))}
        <Route path={path}>
          <Redirect to={`${path}/inventory`} />
        </Route>
      </Switch>
    </Router>
  );
}

export default DashboardRouter;
