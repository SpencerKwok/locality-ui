import { useEffect, useState } from "react";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";

import { GetRpcClient, PostRpcClient } from "../../components/common/RpcClient";
import SettingsPage from "../../components/dashboard/Settings";
import DashboardLayout from "../../components/dashboard/Layout";
import RootLayout from "../../components/common/RootLayout";
import { useWindowSize } from "../../lib/common";

import type { BaseBusiness } from "../../common/Schema";
import type { GetServerSideProps } from "next";
import type { Session } from "next-auth";
import type {
  EtsyUpdateUploadSettingsRequest,
  ShopifyUpdateUploadSettingsRequest,
  SquareUpdateUploadSettingsRequest,
} from "../../components/dashboard/Settings";

function getDepartments(url: string) {
  return GetRpcClient.getInstance().call("Departments", url);
}

function getBusiness(url: string) {
  return GetRpcClient.getInstance().call("Business", url);
}

function getBusinesses(url: string) {
  return GetRpcClient.getInstance().call("Businesses", url);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
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
      session,
      businesses,
    },
  };
};

interface SettingsProps {
  session: Session | null;
  businesses: Array<BaseBusiness>;
}

export default function Account({ businesses, session }: SettingsProps) {
  const router = useRouter();
  const size = useWindowSize();

  const [businessIndex, setBusinessIndex] = useState(0);
  const [departments, setDepartments] = useState<Array<string>>([]);
  const [updateUploadSettingsStatus, setUpdateUploadSettingsStatus] = useState({
    error: "",
    successful: false,
  });

  useEffect(() => {
    getDepartments("/api/departments/get").then(({ departments }) => {
      setDepartments(departments);
    });
    getSession().then((value) => {
      if (!value || !value.user) {
        router.push("/");
      }
    });
  }, []);

  const onSubmitEtsyUploadSettings = async ({
    includeTags,
    excludeTags,
  }: EtsyUpdateUploadSettingsRequest) => {
    const req = {
      id: businesses[businessIndex].id,
      etsy: {
        includeTags: (includeTags || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        excludeTags: (excludeTags || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      },
    };

    await PostRpcClient.getInstance()
      .call("EtsyUploadSettingsUpdate", req)
      .then(({ error, etsy }) => {
        if (error) {
          setUpdateUploadSettingsStatus({
            error: error,
            successful: false,
          });
          return;
        }

        businesses[businessIndex].uploadSettings = {
          ...businesses[businessIndex].uploadSettings,
          etsy,
        };
        setUpdateUploadSettingsStatus({
          error: "",
          successful: true,
        });
      });
  };

  const onSubmitShopifyUploadSettings = async ({
    includeTags,
    excludeTags,
    departmentMapping,
  }: ShopifyUpdateUploadSettingsRequest) => {
    const req = {
      id: businesses[businessIndex].id,
      shopify: {
        includeTags: (includeTags || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        excludeTags: (excludeTags || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        departmentMapping: (departmentMapping || [])
          .map(({ key, departments }) => ({
            key: key.trim(),
            departments: (departments || []).map((department) =>
              department.trim()
            ),
          }))
          .filter(
            ({ key, departments }) => key !== "" && departments.length !== 0
          ),
      },
    };

    await PostRpcClient.getInstance()
      .call("ShopifyUploadSettingsUpdate", req)
      .then(({ error, shopify }) => {
        if (error) {
          setUpdateUploadSettingsStatus({
            error: error,
            successful: false,
          });
          return;
        }

        businesses[businessIndex].uploadSettings = {
          ...businesses[businessIndex].uploadSettings,
          shopify,
        };
        setUpdateUploadSettingsStatus({
          error: "",
          successful: true,
        });
      });
  };

  const onSubmitSquareUploadSettings = async ({
    includeTags,
    excludeTags,
    departmentMapping,
  }: SquareUpdateUploadSettingsRequest) => {
    const req = {
      id: businesses[businessIndex].id,
      square: {
        includeTags: (includeTags || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        excludeTags: (excludeTags || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        departmentMapping: (departmentMapping || [])
          .map(({ key, departments }) => ({
            key: key.trim(),
            departments: (departments || []).map((department) =>
              department.trim()
            ),
          }))
          .filter(
            ({ key, departments }) => key !== "" && departments.length !== 0
          ),
      },
    };

    await PostRpcClient.getInstance()
      .call("SquareUploadSettingsUpdate", req)
      .then(({ error, square }) => {
        if (error) {
          setUpdateUploadSettingsStatus({
            error: error,
            successful: false,
          });
          return;
        }

        businesses[businessIndex].uploadSettings = {
          ...businesses[businessIndex].uploadSettings,
          square,
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
            departments={departments}
            updateUploadSettingsStatus={updateUploadSettingsStatus}
            height={size.height}
            onBusinessClick={onBusinessClick}
            onSubmitEtsyUploadSettings={onSubmitEtsyUploadSettings}
            onSubmitShopifyUploadSettings={onSubmitShopifyUploadSettings}
            onSubmitSquareUploadSettings={onSubmitSquareUploadSettings}
          />
        )}
      </DashboardLayout>
    </RootLayout>
  );
}
