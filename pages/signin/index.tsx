import { useState } from "react";
import { getSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";

import SigninPage from "../../components/signin/Signin";
import RootLayout from "../../components/common/RootLayout";

import type { Session } from "next-auth";
import type { SignInRequest } from "../../components/signin/Signin";

export interface SignUpProps {
  session: Session | null;
}

export default function Signin({ session }: SignUpProps) {
  const [error, setError] = useState("");
  const [currentSession, setCurrentSession] = useState(session);
  const router = useRouter();

  const onSubmit = async (values: SignInRequest) => {
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    getSession().then((value) => {
      if (!value || !value.user) {
        setError(
          "Sign in failed. Please check the details you provided are correct."
        );
        return;
      }
      setCurrentSession(value);
    });
  };

  const onProviderSignIn = (provider: string) => {
    signIn(provider, { redirect: false });
  };

  if (currentSession && currentSession.user) {
    const user: any = currentSession.user;
    router.push(user.isBusiness ? "/dashboard" : "/");
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
