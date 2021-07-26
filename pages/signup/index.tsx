import { useRouter } from "next/router";

import SignUpPage from "components/signup/Signup";
import RootLayout from "components/common/RootLayout";

import type { FC } from "react";
import type { Session } from "next-auth";

export interface SignUpProps {
  session: Session | null;
}

const SignUp: FC<SignUpProps> = ({ session }) => {
  const router = useRouter();

  if (session?.user) {
    const user: any = session.user;
    void router.push(user.isBusiness === true ? "/dashboard" : "/");
    return null;
  }

  return (
    <RootLayout session={session}>
      <SignUpPage />
    </RootLayout>
  );
};

export default SignUp;
