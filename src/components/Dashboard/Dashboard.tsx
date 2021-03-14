import React from "react";
import Cookie from "js-cookie";
import { Tabs, Tab } from "react-bootstrap";
import { Redirect } from "react-router-dom";

import Account from "./Account/Account";
import Company from "./Company/Company";
import Inventory from "./Inventory/Inventory";

export interface DashboardProps extends React.HTMLProps<HTMLDivElement> {
  height: number;
  width: number;
}

function Dashboard(props: DashboardProps) {
  const companyId = Cookie.get("companyId");
  if (!companyId) {
    return <Redirect to="/signin" />;
  }

  return (
    <div style={{ padding: "12px 0px 0px 12px" }}>
      <Tabs defaultActiveKey="inventory">
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

export default Dashboard;
