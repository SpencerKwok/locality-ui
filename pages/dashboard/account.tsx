import { useState } from "react";
import { GetServerSideProps } from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/client";
import { useRouter } from "next/router";

import AccountPage, {
  UpdatePasswordRequest,
} from "../../components/dashboard/Account";
import { PostRpcClient } from "../../components/common/RpcClient";
import RootLayout from "../../components/common/RootLayout";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookie = context.req.headers.cookie || "";
  const session = await getSession(context);
  return {
    props: {
      cookie,
      session,
    },
  };
};

interface AccountProps {
  session: Session | null;
  cookie?: string;
}

export default function Account({ cookie }: AccountProps) {
  const router = useRouter();
  const [session, loading] = useSession();
  const [updatePasswordStatus, setUpdatePasswordStatus] = useState({
    error: "",
    updatedPassword: false,
  });

  const onSubmitPassword = async (values: UpdatePasswordRequest) => {
    await PostRpcClient.getInstance()
      .call(
        "PasswordUpdate",
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword1,
        },
        cookie
      )
      .then(({ error }) => {
        if (error) {
          setUpdatePasswordStatus({ error, updatedPassword: false });
          return;
        }
        setUpdatePasswordStatus({ error: "", updatedPassword: true });
      })
      .catch((error) => {
        setUpdatePasswordStatus({ error, updatedPassword: false });
      });
  };

  if (loading) {
    return null;
  }

  if (!session || !session.user) {
    if (typeof window !== "undefined") {
      router.push("/");
    }
    return null;
  }

  const user: any = session.user;
  const firstName: string = user.firstName;
  const lastName: string = user.lastName;
  return (
    <RootLayout>
      <AccountPage
        error={updatePasswordStatus.error}
        updatedPassword={updatePasswordStatus.updatedPassword}
        firstName={firstName}
        lastName={lastName}
        onSubmitPassword={onSubmitPassword}
      />
    </RootLayout>
  );
}
