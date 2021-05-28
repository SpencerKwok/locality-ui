import { useEffect, useState } from "react";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";
import { encode } from "html-entities";

import BusinessPage from "../../components/dashboard/Business";
import DashboardLayout from "../../components/dashboard/Layout";
import RootLayout from "../../components/common/RootLayout";
import { GetRpcClient, PostRpcClient } from "../../components/common/RpcClient";
import { useWindowSize } from "../../lib/common";

import type { GetServerSideProps } from "next";
import type {
  BaseBusiness,
  UploadSettingsUpdateRequest,
} from "../../components/common/Schema";
import type { Session } from "next-auth";
import type {
  UpdateDepartmentsRequest,
  UpdateHomepagesRequest,
  UpdateLogoRequest,
  UpdateUploadSettingsRequest,
} from "../../components/dashboard/Business";

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
  const cookie = context.req.headers.cookie || "";
  const session = await getSession(context);
  const isNewBusiness = context.query.newBusiness === "true";
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
      isNewBusiness,
      businesses,
    },
  };
};

interface BusinessProps {
  isNewBusiness: boolean;
  businesses: Array<BaseBusiness>;
  session: Session | null;
  cookie?: string;
}

export default function Business({
  isNewBusiness,
  businesses,
  session,
  cookie,
}: BusinessProps) {
  const router = useRouter();
  const size = useWindowSize();

  const [businessIndex, setBusinessIndex] = useState(0);
  const [departments, setDepartments] = useState<Array<string>>([]);
  const [updateDepartmentsStatus, setUpdateDepartmentsStatus] = useState({
    error: "",
    successful: false,
  });
  const [updateHomepagesStatus, setUpdateHomepageStatus] = useState({
    error: "",
    successful: false,
  });
  const [updateLogoStatus, setUpdateLogoStatus] = useState({
    error: "",
    successful: false,
  });
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

  const onSubmitDepartments = async ({
    departments,
  }: UpdateDepartmentsRequest) => {
    await PostRpcClient.getInstance()
      .call(
        "DepartmentsUpdate",
        {
          id: businesses[businessIndex].id,
          departments: departments.map((value) => encode(value.trim())),
        },
        cookie
      )
      .then(({ departments, error }) => {
        if (error) {
          setUpdateDepartmentsStatus({ error, successful: false });
          return;
        }

        businesses[businessIndex].departments = departments.join(":");
        setUpdateDepartmentsStatus({ error: "", successful: true });
      })
      .catch((error) => {
        setUpdateDepartmentsStatus({ error, successful: false });
      });
  };

  const onSubmitHomepages = async ({
    homepage,
    etsyHomepage,
    shopifyHomepage,
    squareHomepage,
  }: UpdateHomepagesRequest) => {
    await PostRpcClient.getInstance()
      .call(
        "HomepagesUpdate",
        {
          id: businesses[businessIndex].id,
          homepages: {
            homepage,
            etsyHomepage,
            shopifyHomepage,
            squareHomepage,
          },
        },
        cookie
      )
      .then(({ homepages, error }) => {
        if (error) {
          setUpdateHomepageStatus({ error, successful: false });
          return;
        }
        businesses[businessIndex].homepages = homepages;
        setUpdateHomepageStatus({ error: "", successful: true });
      })
      .catch((error) => {
        setUpdateHomepageStatus({ error, successful: false });
      });
  };

  const onSubmitLogo = async ({ logo }: UpdateLogoRequest) => {
    await PostRpcClient.getInstance()
      .call(
        "LogoUpdate",
        {
          id: businesses[businessIndex].id,
          logo,
        },
        cookie
      )
      .then(({ logo, error }) => {
        if (error) {
          setUpdateLogoStatus({ error, successful: false });
          return;
        }
        businesses[businessIndex].logo = logo;
        setUpdateLogoStatus({ error: "", successful: true });
      })
      .catch((error) => {
        setUpdateLogoStatus({ error, successful: false });
      });
  };

  const onSubmitUploadSettings = async ({
    Etsy,
    Shopify,
  }: UpdateUploadSettingsRequest) => {
    const req = {
      id: businesses[businessIndex].id,
      Etsy: Etsy && {
        includeTags: Etsy.includeTags
          ? Etsy.includeTags
              .split(",")
              .map((x) => encode(x.trim()))
              .filter(Boolean)
          : undefined,
        excludeTags: Etsy.excludeTags
          ? Etsy.excludeTags
              .split(",")
              .map((x) => encode(x.trim()))
              .filter(Boolean)
          : undefined,
      },
      Shopify: Shopify && {
        includeTags: Shopify.includeTags
          ? Shopify.includeTags
              .split(",")
              .map((x) => encode(x.trim()))
              .filter(Boolean)
          : undefined,
        excludeTags: Shopify.excludeTags
          ? Shopify.excludeTags
              .split(",")
              .map((x) => encode(x.trim()))
              .filter(Boolean)
          : undefined,
      },
    } as UploadSettingsUpdateRequest;

    await PostRpcClient.getInstance()
      .call("UploadSettingsUpdate", req)
      .then(({ error, Etsy, Shopify }) => {
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
        };
        setUpdateUploadSettingsStatus({
          error: "",
          successful: true,
        });
      });
  };

  const onBusinessClick = (index: number) => {
    setBusinessIndex(index);
    setUpdateDepartmentsStatus({
      error: "",
      successful: false,
    });
    setUpdateHomepageStatus({
      error: "",
      successful: false,
    });
    setUpdateLogoStatus({
      error: "",
      successful: false,
    });
    setUpdateUploadSettingsStatus({
      error: "",
      successful: false,
    });
  };

  if (!session || !session.user) {
    return null;
  }

  if (!size.height) {
    return (
      <RootLayout session={session}>
        <DashboardLayout tab="business" />
      </RootLayout>
    );
  }

  return (
    <RootLayout session={session}>
      <DashboardLayout tab="business">
        <BusinessPage
          isNewBusiness={isNewBusiness}
          businesses={businesses}
          businessIndex={businessIndex}
          departments={departments}
          updateDepartmentsStatus={updateDepartmentsStatus}
          updateHomepagesStatus={updateHomepagesStatus}
          updateLogoStatus={updateLogoStatus}
          updateUploadSettingsStatus={updateUploadSettingsStatus}
          height={size.height}
          onBusinessClick={onBusinessClick}
          onSubmitDepartments={onSubmitDepartments}
          onSubmitLogo={onSubmitLogo}
          onSubmitHomepages={onSubmitHomepages}
          onSubmitUploadSettings={onSubmitUploadSettings}
        />
      </DashboardLayout>
    </RootLayout>
  );
}
