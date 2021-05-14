import { useState } from "react";
import { GetServerSideProps } from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/client";
import { useRouter } from "next/router";

import BusinessPage, {
  UpdateDepartmentsRequest,
  UpdateHomepagesRequest,
  UpdateLogoRequest,
} from "../../components/dashboard/Business";
import { GetRpcClient, PostRpcClient } from "../../components/common/RpcClient";
import RootLayout from "../../components/common/RootLayout";
import { BaseBusiness } from "../../components/common/Schema";
import { useWindowSize } from "../../lib/common";

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

  const departments = await getDepartments("/api/departments/get").then(
    ({ departments }) => departments
  );

  return {
    props: {
      cookie,
      departments,
      session,
      isNewBusiness,
      businesses,
    },
  };
};

interface BusinessProps {
  isNewBusiness: boolean;
  businesses: Array<BaseBusiness>;
  departments: Array<string>;
  session: Session | null;
  cookie?: string;
}

export default function Business({
  isNewBusiness,
  businesses,
  cookie,
  departments,
}: BusinessProps) {
  const router = useRouter();
  const [session, loading] = useSession();
  const size = useWindowSize();

  const [businessIndex, setBusinessIndex] = useState(0);
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

  const onSubmitDepartments = async ({
    departments,
  }: UpdateDepartmentsRequest) => {
    await PostRpcClient.getInstance()
      .call(
        "DepartmentsUpdate",
        {
          id: businesses[businessIndex].id,
          departments,
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
    shopifyHomepage,
    etsyHomepage,
  }: UpdateHomepagesRequest) => {
    await PostRpcClient.getInstance()
      .call(
        "HomepagesUpdate",
        {
          id: businesses[businessIndex].id,
          homepage,
          shopifyHomepage: shopifyHomepage || "",
          etsyHomepage: etsyHomepage || "",
        },
        cookie
      )
      .then(({ homepage, shopifyHomepage, etsyHomepage, error }) => {
        if (error) {
          setUpdateHomepageStatus({ error, successful: false });
          return;
        }
        businesses[businessIndex].homepage = homepage;
        businesses[businessIndex].shopifyHomepage = shopifyHomepage;
        businesses[businessIndex].etsyHomepage = etsyHomepage;
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

  if (loading) {
    return null;
  }

  if (!session || !session.user) {
    if (typeof window !== "undefined") {
      router.push("/");
    }
    return null;
  }

  if (!size.height) {
    return <RootLayout />;
  }

  return (
    <RootLayout>
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
    </RootLayout>
  );
}
