import { useState } from "react";
import { getSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";

import { PostRpcClient } from "components/common/RpcClient";
import RootLayout from "components/common/RootLayout";
import SignUpUser from "components/signup/SignupUser";

import type { FC } from "react";
import type { Session } from "next-auth";
import type { SignUpRequest } from "components/signup/SignupUser";
import { useWindowSize } from "lib/common";

export interface UserSignUpProps {
  session: Session | null;
}

const UserSignUp: FC<UserSignUpProps> = ({ session }) => {
  const [error, setError] = useState("");
  const router = useRouter();
  const size = useWindowSize();

  const onSubmit = async (values: SignUpRequest): Promise<void> => {
    await PostRpcClient.getInstance()
      .call("UserSignUp", values)
      .then(async ({ error }) => {
        if (typeof error === "string" && error) {
          setError(error);
          return;
        }

        await signIn("credentials", {
          email: values.email,
          password: values.password1,
          redirect: false,
        });

        const newSession = await getSession();
        if (!newSession || !newSession.user) {
          setError(
            "Sign in failed. Please check the details you provided are correct."
          );
          return;
        }
        void router.push("/?newUser=true");
      })
      .catch((error) => {
        setError(error);
      });
  };

  if (session?.user) {
    const user: any = session.user;

    // Need to refresh CSP
    window.location.assign(
      user.isBusiness === true && (size.width ?? 0) > 840 ? "/dashboard" : "/"
    );
    return null;
  }

  return (
    <RootLayout session={session}>
      <SignUpUser error={error} onSubmit={onSubmit} />
    </RootLayout>
  );
};

export default UserSignUp;
