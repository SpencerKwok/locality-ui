import { useEffect, useState } from "react";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";

import BusinessPage from "../../components/dashboard/Business";
import DashboardLayout from "../../components/dashboard/Layout";
import RootLayout from "../../components/common/RootLayout";
import { GetRpcClient, PostRpcClient } from "../../components/common/RpcClient";
import { useWindowSize } from "../../lib/common";

import type { GetServerSideProps } from "next";
import type { BaseBusiness } from "../../common/Schema";
import type { Session } from "next-auth";
import type {
  UpdateDepartmentsRequest,
  UpdateHomepagesRequest,
  UpdateLogoRequest,
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
          departments: departments.map((value) => value.trim()),
        },
        cookie
      )
      .then(({ departments, error }) => {
        if (error) {
          setUpdateDepartmentsStatus({ error, successful: false });
          return;
        }

        businesses[businessIndex].departments = departments;
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
          homepage,
          etsyHomepage,
          shopifyHomepage,
          squareHomepage,
        },
        cookie
      )
      .then((res) => {
        if (res.error) {
          setUpdateHomepageStatus({ error: res.error, successful: false });
          return;
        }
        businesses[businessIndex].homepages = res;
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
  };

  if (!session || !session.user) {
    return null;
  }

  return (
    <RootLayout session={session}>
      <DashboardLayout tab="business">
        {size.height && (
          <BusinessPage
            isNewBusiness={isNewBusiness}
            businesses={businesses}
            businessIndex={businessIndex}
            departments={departments}
            updateDepartmentsStatus={updateDepartmentsStatus}
            updateHomepagesStatus={updateHomepagesStatus}
            updateLogoStatus={updateLogoStatus}
            height={size.height}
            onBusinessClick={onBusinessClick}
            onSubmitDepartments={onSubmitDepartments}
            onSubmitLogo={onSubmitLogo}
            onSubmitHomepages={onSubmitHomepages}
          />
        )}
      </DashboardLayout>
    </RootLayout>
  );
}
