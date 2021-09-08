import { useState } from "react";

import { PostRpcClient } from "components/common/RpcClient";
import RootLayout from "components/common/RootLayout";
import SignUpBusiness, {
  SignUpRequest,
} from "components/signup/SignupBusiness";

import type { FC } from "react";
import type { Session } from "next-auth";
import { useWindowSize } from "lib/common";

export interface BusinessSignUpProps {
  session: Session | null;
}

const BusinessSignUp: FC<BusinessSignUpProps> = ({ session }) => {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const size = useWindowSize();

  const onSubmit = async (values: SignUpRequest): Promise<void> => {
    await PostRpcClient.getInstance()
      .call("BusinessSignUp", values)
      .then(async ({ error }) => {
        if (typeof error === "string" && error) {
          setError(error);
        } else {
          setSent(true);
        }
      })
      .catch((error) => {
        setError(error);
      });
  };

  if (session?.user) {
    const user: any = session.user;

    // Need to refresh CSP
    window.location.assign(
      user.isBusiness === true && (size.width ?? 0) > 840
        ? "/dashboard?tab=inventory"
        : "/"
    );
    return null;
  }

  return (
    <RootLayout session={session}>
      <SignUpBusiness error={error} sent={sent} onSubmit={onSubmit} />
    </RootLayout>
  );
};

export default BusinessSignUp;
