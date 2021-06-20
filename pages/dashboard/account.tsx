import { useEffect, useState } from "react";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";

import AccountPage from "../../components/dashboard/Account";
import { PostRpcClient } from "../../components/common/RpcClient";
import DashboardLayout from "../../components/dashboard/Layout";
import RootLayout from "../../components/common/RootLayout";

import type { GetServerSideProps } from "next";
import type { Session } from "next-auth";
import type { PasswordUpdateRequest } from "../../components/dashboard/Account";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  return {
    props: {
      session,
    },
  };
};

interface AccountProps {
  session: Session | null;
}

export default function Account({ session }: AccountProps) {
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

  const onSubmitPassword = async (values: PasswordUpdateRequest) => {
    await PostRpcClient.getInstance()
      .call("PasswordUpdate", values)
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
