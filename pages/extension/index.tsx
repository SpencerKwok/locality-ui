import ExtensionPage from "components/extension/Extension";
import RootLayout from "components/common/RootLayout";

import type { FC } from "react";
import type { Session } from "next-auth";

export interface ExtensionProps {
  session: Session | null;
}

const Extension: FC<ExtensionProps> = ({ session }) => {
  return (
    <RootLayout session={session}>
      <ExtensionPage />
    </RootLayout>
  );
};

export default Extension;
