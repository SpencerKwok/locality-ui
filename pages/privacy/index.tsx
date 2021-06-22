import RootLayout from "components/common/RootLayout";

import type { FC } from "react";
import type { Session } from "next-auth";

export interface PrivacyProps {
  session: Session | null;
}

const Privacy: FC<PrivacyProps> = ({ session }) => {
  return (
    <RootLayout session={session}>
      <div style={{ marginLeft: 12 }}>
        <h1>Privacy Policy</h1>
        <p>
          User data will not be sold to third parties unless required by law.
        </p>
        <p>
          User data will not be used or transferred for purposes that are
          unrelated to the item's core functionality as seen on the Locality
          about page.
        </p>
        <p>
          User data will not be used or transferred to determine
          creditworthiness or for lending purposes.
        </p>
      </div>
    </RootLayout>
  );
};

export default Privacy;
