import { useRouter } from "next/router";

import SignUpPage from "components/signup/Signup";
import RootLayout from "components/common/RootLayout";

import type { FC } from "react";
import type { Session } from "next-auth";
import { useWindowSize } from "lib/common";

export interface SignUpProps {
  session: Session | null;
}

const SignUp: FC<SignUpProps> = ({ session }) => {
  const router = useRouter();
  const size = useWindowSize();

  if (session?.user) {
    const user: any = session.user;
    void router.push(
      user.isBusiness === true && (size.width ?? 0) > 840 ? "/dashboard" : "/"
    );
    return null;
  }

  return (
    <RootLayout session={session}>
      <SignUpPage />
    </RootLayout>
  );
};

export default SignUp;
