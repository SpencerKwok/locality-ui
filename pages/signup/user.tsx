import { useState } from "react";
import { getSession, useSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";

import { PostRpcClient } from "../../components/common/RpcClient";
import RootLayout from "../../components/common/RootLayout";
import SignUpUser, { SignUpRequest } from "../../components/signup/SignupUser";

export default function UserSignUp() {
  const [error, setError] = useState("");
  const [session, loading] = useSession();
  const router = useRouter();

  const onSubmit = async (values: SignUpRequest) => {
    await PostRpcClient.getInstance()
      .call("UserSignUp", {
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
      })
      .catch((error) => {
        setError(error);
      });
  };

  if (loading) {
    return null;
  }

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
