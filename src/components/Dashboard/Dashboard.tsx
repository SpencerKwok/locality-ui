import React from "react";
import { Tabs, Tab } from "react-bootstrap";

import Inventory from "./Inventory/Inventory";
import Profile from "./Profile/Profile";
import Window from "../../utils/window";

export interface DashboardProps extends React.HTMLProps<HTMLDivElement> {}

function Dashboard(props: DashboardProps) {
  const windowSize = Window();

  return (
    <div style={{ padding: 12 }}>
      <Tabs defaultActiveKey="inventory">
        <Tab eventKey="inventory" title="Inventory">
          <Inventory width={windowSize.width} height={windowSize.height} />
        </Tab>
        <Tab eventKey="profile" title="Profile">
          <Profile />
        </Tab>
      </Tabs>
    </div>
  );
}

export default Dashboard;
