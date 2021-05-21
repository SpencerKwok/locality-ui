import RootLayout from "../components/common/RootLayout";

import type { Session } from "next-auth";

export interface OfflineProps {
  session: Session | null;
}

export default function Offline({ session }: OfflineProps) {
  return (
    <RootLayout session={session}>
      <div style={{ marginLeft: 12 }}>
        <h1>No Internet Connection</h1>
        <p>Yippers! It looks like the internet died...</p>
      </div>
    </RootLayout>
  );
}
