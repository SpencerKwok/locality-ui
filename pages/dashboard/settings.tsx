import { useEffect, useState } from "react";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";

import { GetRpcClient, PostRpcClient } from "../../components/common/RpcClient";
import SettingsPage from "../../components/dashboard/Settings";
import DashboardLayout from "../../components/dashboard/Layout";
import RootLayout from "../../components/common/RootLayout";
import { useWindowSize } from "../../lib/common";

import type {
  BaseBusiness,
  UploadSettingsUpdateRequest,
} from "../../components/common/Schema";
import type { GetServerSideProps } from "next";
import type { Session } from "next-auth";
import type { UpdateUploadSettingsRequest } from "../../components/dashboard/Settings";

function getBusiness(url: string) {
  return GetRpcClient.getInstance().call("Business", url);
}

function getBusinesses(url: string) {
  return GetRpcClient.getInstance().call("Businesses", url);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookie = context.req.headers.cookie || "";
  const session = await getSession(context);
  let businesses = Array<BaseBusiness>();

  if (session && session.user) {
    const user: any = session.user;
    if (user.id === 0) {
      businesses = await getBusinesses("/api/businesses").then(
        ({ businesses }) => businesses
      );
    } else if (user.id) {
      businesses = await getBusiness(
        `/api/business?id=${user.id}`
      ).then(({ business }) => [business]);
    }
  }

  return {
    props: {
      cookie,
      session,
      businesses,
    },
  };
};

interface SettingsProps {
  cookie?: string;
  session: Session | null;
  businesses: Array<BaseBusiness>;
}

export default function Account({
  cookie,
  businesses,
  session,
}: SettingsProps) {
  const router = useRouter();
  const size = useWindowSize();

  const [businessIndex, setBusinessIndex] = useState(0);
  const [updateUploadSettingsStatus, setUpdateUploadSettingsStatus] = useState({
    error: "",
    successful: false,
  });

  useEffect(() => {
    getSession().then((value) => {
      if (!value || !value.user) {
        router.push("/");
      }
    });
  }, []);

  const onSubmitUploadSettings = async ({
    Etsy,
    Shopify,
    Square,
  }: UpdateUploadSettingsRequest) => {
    const req = {
      id: businesses[businessIndex].id,
      Etsy: Etsy && {
        includeTags: Etsy.includeTags
          ? Etsy.includeTags
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          : undefined,
        excludeTags: Etsy.excludeTags
          ? Etsy.excludeTags
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          : undefined,
      },
      Shopify: Shopify && {
        includeTags: Shopify.includeTags
          ? Shopify.includeTags
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          : undefined,
        excludeTags: Shopify.excludeTags
          ? Shopify.excludeTags
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          : undefined,
      },
      Square: Square && {
        includeTags: Square.includeTags
          ? Square.includeTags
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          : undefined,
        excludeTags: Square.excludeTags
          ? Square.excludeTags
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          : undefined,
      },
    } as UploadSettingsUpdateRequest;

    await PostRpcClient.getInstance()
      .call("UploadSettingsUpdate", req, cookie)
      .then(({ error, Etsy, Shopify, Square }) => {
        if (error) {
          setUpdateUploadSettingsStatus({
            error: error,
            successful: false,
          });
          return;
        }

        businesses[businessIndex].uploadSettings = {
          Etsy,
          Shopify,
          Square,
        };
        setUpdateUploadSettingsStatus({
          error: "",
          successful: true,
        });
      });
  };

  const onBusinessClick = (index: number) => {
    setBusinessIndex(index);
    setUpdateUploadSettingsStatus({
      error: "",
      successful: false,
    });
  };

  if (!session || !session.user) {
    return null;
  }

  return (
    <RootLayout session={session}>
      <DashboardLayout tab="settings">
        {size.height && (
          <SettingsPage
            businesses={businesses}
            businessIndex={businessIndex}
            updateUploadSettingsStatus={updateUploadSettingsStatus}
            height={size.height}
            onBusinessClick={onBusinessClick}
            onSubmitUploadSettings={onSubmitUploadSettings}
          />
        )}
      </DashboardLayout>
    </RootLayout>
  );
}
