import { useEffect, useState } from "react";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";

import AccountPage from "../../components/dashboard/Account";
import { PostRpcClient } from "../../components/common/RpcClient";
import DashboardLayout from "../../components/dashboard/Layout";
import RootLayout from "../../components/common/RootLayout";

import type { GetServerSideProps } from "next";
import type { Session } from "next-auth";
import type { UpdatePasswordRequest } from "../../components/dashboard/Account";

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

export default function Account({ cookie, session }: AccountProps) {
  const router = useRouter();
  const [updatePasswordStatus, setUpdatePasswordStatus] = useState({
    error: "",
    updatedPassword: false,
  });

  useEffect(() => {
    getSession().then((value) => {
      if (!value || !value.user) {
        router.push("/");
      }
    });
  }, []);

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

  if (!session || !session.user) {
    return null;
  }

  const user: any = session.user;
  const firstName: string = user.firstName;
  const lastName: string = user.lastName;
  return (
    <RootLayout session={session}>
      <DashboardLayout tab="account">
        <AccountPage
          error={updatePasswordStatus.error}
          updatedPassword={updatePasswordStatus.updatedPassword}
          firstName={firstName}
          lastName={lastName}
          onSubmitPassword={onSubmitPassword}
        />
      </DashboardLayout>
    </RootLayout>
  );
}
