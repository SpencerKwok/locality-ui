import { useEffect, useState } from "react";
import { getSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";

import { PostRpcClient } from "../../components/common/RpcClient";
import RootLayout from "../../components/common/RootLayout";
import SignUpUser from "../../components/signup/SignupUser";

import type { SignUpRequest } from "../../components/signup/SignupUser";
import type { Session } from "next-auth";

export default function UserSignUp() {
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

  const onSubmit = async (values: SignUpRequest) => {
    await PostRpcClient.getInstance()
      .call("UserSignUp", {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password1,
      })
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

        getSession().then((value) => {
          if (value && value.user) {
            setSession(value);
          } else {
            setError(
              "Sign up failed. Please contact us at locality.info@yahoo.com for assistance."
            );
          }
        });
      })
      .catch((error) => {
        setError(error);
      });
  };

  if (session && session.user) {
    router.push("/?newUser=true");
    return null;
  }

  return (
    <RootLayout>
      <SignUpUser error={error} onSubmit={onSubmit} />
    </RootLayout>
  );
}
