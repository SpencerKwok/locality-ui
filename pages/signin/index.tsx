import { useEffect, useState } from "react";
import { getSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";

import SigninPage from "../../components/signin/Signin";
import RootLayout from "../../components/common/RootLayout";

import type { Session } from "next-auth";
import type { SignInRequest } from "../../components/signin/Signin";

export default function Signin() {
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    getSession().then((value) => {
      if (value !== session) {
        setSession(value);
      }
    });
  }, []);

  const onSubmit = async (values: SignInRequest) => {
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    getSession().then((value) => {
      if (value && value.user) {
        setSession(value);
      } else {
        setError(
          "Sign in failed. Please check the details you provided are correct."
        );
      }
    });
  };

  const onProviderSignIn = (provider: string) => {
    signIn(provider, { redirect: false });
  };

  if (session && session.user) {
    const user: any = session.user;
    router.push(user.isBusiness ? "/dashboard" : "/");
    return null;
  }

  return (
    <RootLayout>
      <SigninPage
        error={error}
        onSubmit={onSubmit}
        onProviderSignIn={onProviderSignIn}
      />
    </RootLayout>
  );
}
