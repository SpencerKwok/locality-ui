import { useState } from "react";
import { getSession, useSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";

import SigninPage, { SignInRequest } from "../../components/signin/Signin";
import RootLayout from "../../components/common/RootLayout";

export default function Signin() {
  const [error, setError] = useState("");
  const [session, loading] = useSession();
  const router = useRouter();

  const onSubmit = async (values: SignInRequest) => {
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    const session = await getSession();
    if (session && session.user) {
      const user: any = session.user;
      router.push(user.isBusiness ? "/dashboard" : "/");
    } else {
      setError(
        "Sign in failed. Please check the details you provided are correct."
      );
    }
  };

  const onProviderSignIn = (provider: string) => {
    signIn(provider, { redirect: false });
  };

  if (loading) {
    return null;
  }

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
