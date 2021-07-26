import { useState } from "react";
import { getSession, signIn } from "next-auth/client";

import SigninPage from "components/signin/Signin";
import RootLayout from "components/common/RootLayout";

import type { FC } from "react";
import type { Session } from "next-auth";
import type { SignInRequest } from "components/signin/Signin";

export interface SignUpProps {
  session: Session | null;
}

const Signin: FC<SignUpProps> = ({ session }) => {
  const [error, setError] = useState("");

  if (!error) {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");
    if (typeof errorParam === "string" && errorParam) {
      setError(
        "Account does not exist under that email. Please sign up to continue."
      );
    }
  }

  const onSubmit = async (values: SignInRequest): Promise<void> => {
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    const newSession = await getSession();
    if (!newSession || !newSession.user) {
      setError(
        "Sign in failed. Please check the details you provided are correct."
      );
      return;
    }
    const user: any = newSession.user;

    // Need to refresh CSP
    window.location.assign(
      user.isBusiness === true ? "/dashboard?tab=inventory" : "/"
    );
  };

  const onProviderSignIn = (provider: string): void => {
    // Return undefined for providers
    void signIn(provider, { redirect: false });
  };

  if (session?.user) {
    const user: any = session.user;

    // Need to refresh CSP
    window.location.assign(
      user.isBusiness === true ? "/dashboard?tab=inventory" : "/"
    );
    return null;
  }

  return (
    <RootLayout session={session}>
      <SigninPage
        error={error}
        onSubmit={onSubmit}
        onProviderSignIn={onProviderSignIn}
      />
    </RootLayout>
  );
};

export default Signin;
