import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/client";

import SignUpDesktop from "../../components/signup/SignupDesktop";
import SignUpMobile from "../../components/signup/SignupMobile";
import RootLayout from "../../components/common/RootLayout";
import { useMediaQuery } from "../../lib/common";

export default function SignUp() {
  const [session, loading] = useSession();
  const isNarrow = useMediaQuery(42, "width");
  const router = useRouter();

  if (loading) {
    return null;
  }

  if (session && session.user) {
    router.push("/");
    return null;
  }

  return (
    <RootLayout>{isNarrow ? <SignUpMobile /> : <SignUpDesktop />}</RootLayout>
  );
}
