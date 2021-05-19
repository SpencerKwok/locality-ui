import { useRouter } from "next/router";

import SignUpDesktop from "../../components/signup/SignupDesktop";
import SignUpMobile from "../../components/signup/SignupMobile";
import RootLayout from "../../components/common/RootLayout";
import { useMediaQuery } from "../../lib/common";

import type { Session } from "next-auth";

export interface SignUpProps {
  session: Session | null;
}

export default function SignUp({ session }: SignUpProps) {
  const isNarrow = useMediaQuery(42, "width");
  const router = useRouter();

  if (session && session.user) {
    router.push("/");
    return null;
  }

  return (
    <RootLayout session={session}>
      {isNarrow ? <SignUpMobile /> : <SignUpDesktop />}
    </RootLayout>
  );
}
