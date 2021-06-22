import { useState } from "react";
import { getSession, signIn } from "next-auth/client";

import { PostRpcClient } from "components/common/RpcClient";
import RootLayout from "components/common/RootLayout";
import SignUpBusinessDesktop from "components/signup/SignupBusinessDesktop";
import SignUpBusinessMobile from "components/signup/SignupBusinessMobile";
import { useMediaQuery } from "lib/common";

import type { FC } from "react";
import type { SignUpRequest } from "components/signup/SignupBusinessForm";
import type { Session } from "next-auth";

export interface BusinessSignUpProps {
  session: Session | null;
}

const BusinessSignUp: FC<BusinessSignUpProps> = ({ session }) => {
  const [error, setError] = useState("");
  const isNarrow = useMediaQuery(38, "width");

  const onSubmit = async (values: SignUpRequest): Promise<void> => {
    await PostRpcClient.getInstance()
      .call("BusinessSignUp", values)
      .then(async ({ error }) => {
        if (typeof error === "string" && error) {
          setError(error);
          return;
        }

        await signIn("credentials", {
          email: values.email,
          password: values.password1,
          redirect: false,
        });

        const newSession = await getSession();
        if (!newSession || !newSession.user) {
          setError(
            "Sign up failed. Please check the details you provided are correct."
          );
          return;
        }

        // Need to refresh CSP
        window.location.assign("/dashboard?tab=business&newBusiness=true");
      })
      .catch((error) => {
        setError(error);
      });
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
      {isNarrow ? (
        <SignUpBusinessMobile error={error} onSubmit={onSubmit} />
      ) : (
        <SignUpBusinessDesktop error={error} onSubmit={onSubmit} />
      )}
    </RootLayout>
  );
};

export default BusinessSignUp;
