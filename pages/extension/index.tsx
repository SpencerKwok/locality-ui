import ExtensionPage from "components/extension/Extension";
import RootLayout from "components/common/RootLayout";

import type { Session } from "next-auth";

export interface ExtensionProps {
  session: Session | null;
}

export default function Extension({ session }: ExtensionProps) {
  return (
    <RootLayout session={session}>
      <ExtensionPage />
    </RootLayout>
  );
}
