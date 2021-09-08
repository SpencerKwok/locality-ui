import FaqPage from "components/faq/Faq";
import RootLayout from "components/common/RootLayout";

import type { FC } from "react";
import type { Session } from "next-auth";

export interface FaqProps {
  session: Session | null;
}

const Faq: FC<FaqProps> = ({ session }) => {
  return (
    <RootLayout session={session}>
      <FaqPage />
    </RootLayout>
  );
};

export default Faq;
