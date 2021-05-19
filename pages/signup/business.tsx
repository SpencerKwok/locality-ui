import { useEffect, useState } from "react";
import { getSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";

import { PostRpcClient } from "../../components/common/RpcClient";
import RootLayout from "../../components/common/RootLayout";
import SignUpBusinessDesktop from "../../components/signup/SignupBusinessDesktop";
import SignUpBusinessMobile from "../../components/signup/SignupBusinessMobile";
import { useMediaQuery } from "../../lib/common";

import type { SignUpRequest } from "../../components/signup/SignupBusinessForm";
import type { Session } from "next-auth";

export default function UserSignUp() {
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const isNarrow = useMediaQuery(38, "width");
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
    router.push("/dashboard/business?newBusiness=true");
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
