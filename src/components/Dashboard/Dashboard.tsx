import React from "react";
import Cookie from "js-cookie";
import { Tabs, Tab } from "react-bootstrap";
import { Redirect } from "react-router-dom";

import Inventory from "./Inventory/Inventory";
import Profile from "./Profile/Profile";

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
    <div style={{ padding: 12 }}>
      <Tabs defaultActiveKey="inventory">
        <Tab eventKey="inventory" title="Inventory">
          <Inventory width={props.width} height={props.height} />
        </Tab>
        <Tab eventKey="profile" title="Profile">
          <Profile />
        </Tab>
      </Tabs>
    </div>
  );
}

export default Dashboard;
