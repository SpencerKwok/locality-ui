import RootLayout from "../components/common/RootLayout";

import type { FC } from "react";
import type { Session } from "next-auth";

export interface OfflineProps {
  session: Session | null;
}

const Offline: FC<OfflineProps> = ({ session }) => {
  return (
    <RootLayout session={session}>
      <div style={{ marginLeft: 12 }}>
        <h1>No Internet Connection</h1>
        <p>Yippers! It looks like the internet died...</p>
      </div>
    </RootLayout>
  );
};

export default Offline;
