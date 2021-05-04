import { useState } from "react";
import { getSession, useSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";

import { PostRpcClient } from "../../components/common/RpcClient";
import RootLayout from "../../components/common/RootLayout";
import SignUpBusinessDesktop from "../../components/signup/SignupBusinessDesktop";
import SignUpBusinessMobile from "../../components/signup/SignupBusinessMobile";
import { SignUpRequest } from "../../components/signup/SignupBusinessForm";
import { useMediaQuery } from "../../lib/common";

export default function UserSignUp() {
  const [error, setError] = useState("");
  const [session, loading] = useSession();
  const isNarrow = useMediaQuery(38, "width");
  const router = useRouter();

  const onSubmit = async (values: SignUpRequest) => {
    await PostRpcClient.getInstance()
      .call("BusinessSignUp", {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        businessName: values.businessName,
        address: values.address,
        city: values.city,
        province: values.province,
        country: values.country,
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

        const session = await getSession();
        if (session && session.user) {
          router.push("/dashboard?newBusiness=true");
        }
      })
      .catch((error) => {
        setError(error);
      });
  };

  if (loading) {
    return null;
  }

  if (session && session.user) {
    router.push("/");
    return null;
  }

  return (
    <RootLayout>
      {isNarrow ? (
        <SignUpBusinessMobile error={error} onSubmit={onSubmit} />
      ) : (
        <SignUpBusinessDesktop error={error} onSubmit={onSubmit} />
      )}
    </RootLayout>
  );
}
