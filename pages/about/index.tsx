import AboutPage from "../../components/about/About";
import RootLayout from "../../components/common/RootLayout";
import { useWindowSize } from "../../lib/common";

import type { Session } from "next-auth";

export interface AboutProps {
  session: Session | null;
}

export default function About({ session }: AboutProps) {
  const size = useWindowSize();
  if (!size.width) {
    return <RootLayout session={session} />;
  }

  return (
    <RootLayout session={session}>
      <AboutPage isMobile={size.width <= 720} width={size.width} />
    </RootLayout>
  );
}
