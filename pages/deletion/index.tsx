import RootLayout from "../../components/common/RootLayout";

import type { Session } from "next-auth";

export interface DeletionProps {
  session: Session | null;
}

export default function Deletion({ session }: DeletionProps) {
  return (
    <RootLayout session={session}>
      <div style={{ marginLeft: 12 }}>
        <h1>User Data Deletion Instructions</h1>
        <p>
          Contact Locality at locality.info@yahoo.com with the account's email
          with the subject "Delete My Account" to delete the account
        </p>
      </div>
    </RootLayout>
  );
}
