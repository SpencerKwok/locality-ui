import React from "react";
import { Tabs, Tab } from "react-bootstrap";

import Company from "./Company/Company";
import Window from "../../utils/window";

export interface DashboardProps extends React.HTMLProps<HTMLDivElement> {}

function Dashboard(props: DashboardProps) {
  const windowSize = Window();

  return (
    <div style={{ padding: 12 }}>
      <Tabs defaultActiveKey="company">
        <Tab eventKey="company" title="Company">
          <Company width={windowSize.width} height={windowSize.height} />
        </Tab>
        <Tab eventKey="inventory" title="Inventory">
          Inventory
        </Tab>
      </Tabs>
    </div>
  );
}

export default Dashboard;
