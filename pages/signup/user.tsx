import { useState } from "react";
import { getSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";

import { PostRpcClient } from "../../components/common/RpcClient";
import RootLayout from "../../components/common/RootLayout";
import SignUpUser from "../../components/signup/SignupUser";

import type { SignUpRequest } from "../../components/signup/SignupUser";
import type { Session } from "next-auth";

export interface UserSignUpProps {
  session: Session | null;
}

export default function UserSignUp({ session }: UserSignUpProps) {
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (values: SignUpRequest) => {
    await PostRpcClient.getInstance()
      .call("UserSignUp", values)
      .then(async ({ error }) => {
        if (error) {
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
        router.push("/?newUser=true");
      })
      .catch((error) => {
        setError(error);
      });
  };

  if (session && session.user) {
    const user: any = session.user;

    // Need to refresh CSP
    window.location.assign(user.isBusiness ? "/dashboard" : "/");
    return null;
  }

  return (
    <RootLayout session={session}>
      <SignUpUser error={error} onSubmit={onSubmit} />
    </RootLayout>
  );
}
