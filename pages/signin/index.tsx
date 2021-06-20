import { useState } from "react";
import { getSession, signIn, signOut } from "next-auth/client";

import SigninPage from "../../components/signin/Signin";
import RootLayout from "../../components/common/RootLayout";

import type { Session } from "next-auth";
import type { SignInRequest } from "../../components/signin/Signin";

export interface SignUpProps {
  session: Session | null;
}

export default function Signin({ session }: SignUpProps) {
  const [error, setError] = useState("");

  if (!error) {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");
    if (errorParam) {
      setError(
        "Account does not exist. Please sign up in the top right corner to continue."
      );
    }
  }

  const onSubmit = async (values: SignInRequest) => {
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
    window.location.assign(user.isBusiness ? "/dashboard?tab=inventory" : "/");
  };

  const onProviderSignIn = (provider: string) => {
    signIn(provider, { redirect: false });
  };

  if (session && session.user) {
    const user: any = session.user;

    // Need to refresh CSP
    window.location.assign(user.isBusiness ? "/dashboard?tab=inventory" : "/");
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
}
