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
  const router = useRouter();

  const onSubmit = async (values: SignInRequest) => {
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    await getSession().then((value) => {
      if (!value || !value.user) {
        setError(
          "Sign in failed. Please check the details you provided are correct."
        );
        return;
      }

      const user: any = value.user;
      router.push(user.isBusiness ? "/dashboard" : "/");
    });
  };

  const onProviderSignIn = async (provider: string) => {
    await signIn(provider, { redirect: false });
  };

  if (session && session.user) {
    const user: any = session.user;
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
