import { Children, ReactNode } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useRouter } from "next/router";

export interface DashboardLayoutProps {
  children?: ReactNode;
  tab: "account" | "business" | "inventory" | "settings";
}

export default function DashboardLayout({
  children,
  tab,
}: DashboardLayoutProps) {
  const router = useRouter();
  return (
    <Tabs
      defaultActiveKey={tab}
      onSelect={(key) => router.push(`/dashboard/${key}`)}
    >
      <Tab eventKey="inventory" title="Inventory">
        {tab === "inventory" &&
          Children.map(children, (child) => (
            <div style={{ marginLeft: 12 }}>{child}</div>
          ))}
      </Tab>
      <Tab eventKey="business" title="Business">
        {tab === "business" &&
          Children.map(children, (child) => (
            <div style={{ marginLeft: 12 }}>{child}</div>
          ))}
      </Tab>
      <Tab eventKey="settings" title="Settings">
        {tab === "settings" &&
          Children.map(children, (child) => (
            <div style={{ marginLeft: 12 }}>{child}</div>
          ))}
      </Tab>
      <Tab eventKey="account" title="Account">
        {tab === "account" &&
          Children.map(children, (child) => (
            <div style={{ marginLeft: 12 }}>{child}</div>
          ))}
      </Tab>
    </Tabs>
  );
}
