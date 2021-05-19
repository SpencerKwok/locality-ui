import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/client";

import SignUpDesktop from "../../components/signup/SignupDesktop";
import SignUpMobile from "../../components/signup/SignupMobile";
import RootLayout from "../../components/common/RootLayout";
import { useMediaQuery } from "../../lib/common";

import type { Session } from "next-auth";

export default function SignUp() {
  const [session, setSession] = useState<Session | null>(null);
  const isNarrow = useMediaQuery(42, "width");
  const router = useRouter();

  useEffect(() => {
    getSession().then((value) => {
      if (value !== session) {
        setSession(value);
      }
    });
  }, []);

  if (session && session.user) {
    router.push("/");
    return null;
  }

  return (
    <RootLayout>{isNarrow ? <SignUpMobile /> : <SignUpDesktop />}</RootLayout>
  );
}
