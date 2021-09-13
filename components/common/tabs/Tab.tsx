import type { FC } from "react";

export interface TabProps {
  eventKey: string;
  title: string;
}

const Tabs: FC<TabProps> = ({ children }) => {
  return <div>{children}</div>;
};

export default Tabs;
