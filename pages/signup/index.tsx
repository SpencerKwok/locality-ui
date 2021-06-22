import { useRouter } from "next/router";

import SignUpDesktop from "components/signup/SignupDesktop";
import SignUpMobile from "components/signup/SignupMobile";
import RootLayout from "components/common/RootLayout";
import { useMediaQuery } from "lib/common";

import type { FC } from "react";
import type { Session } from "next-auth";

export interface SignUpProps {
  session: Session | null;
}

const SignUp: FC<SignUpProps> = ({ session }) => {
  const isNarrow = useMediaQuery(42, "width");
  const router = useRouter();

  if (session?.user) {
    const user: any = session.user;
    void router.push(user.isBusiness === true ? "/dashboard" : "/");
    return null;
  }

  return (
    <RootLayout session={session}>
      {isNarrow ? <SignUpMobile /> : <SignUpDesktop />}
    </RootLayout>
  );
};

export default SignUp;
