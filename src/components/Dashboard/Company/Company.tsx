import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Cookie from "js-cookie";
import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import { Redirect } from "react-router-dom";
import Popup from "reactjs-popup";
import Select from "react-dropdown-select";

import CompanyList from "../Company";
import Image, { toBase64 } from "../Image";
import CompanyDAO from "./CompanyDAO";
import Stack from "../../../common/components/Stack/Stack";
import { BaseCompany } from "../../../common/rpc/Schema";
import { CloseButton } from "../../../common/components/Popup/Popup";
import LocalityForm from "../../../common/components/Form";

export interface CompanyProps extends React.HTMLProps<HTMLDivElement> {
  height: number;
  width: number;
}

const FieldLabel = styled.div`
  font-size: 32px;
`;

const FieldValue = styled.div`
  font-size: 24px;
`;

interface UpdateLogoForm {
  image: any;
}

interface UpdateHomepageForm {
  homepage: string;
}

interface UpdateDepartmentsForm {
  departments: Array<string>;
}

const UpdateLogoSchema = yup.object().shape({
  image: yup.mixed().test("Defined", "Required", (value) => {
    return value !== undefined && value !== "";
  }),
});

const UpdateHomepageSchema = yup.object().shape({
  homepage: yup.string().required("Required").max(255, "Too long"),
});

const UpdateDepartmentsSchema = yup.object().shape({
  departments: yup.array().of(yup.string()).optional(),
});

const Departments = [
  "Accessories/Jewelry",
  "Bags",
  "Baby",
  "Beauty & Personal Care",
  "Clothing/Shoes",
  "Entertainment",
  "Electronics",
  "Everything Else/Other",
  "Fitness",
  "Food & Drinks",
  "Groceries",
  "Health & Personal Care",
  "Home & Kitchen",
  "Pet",
  "Sports & Outdoors",
  "Toys & Games",
];

const NewUserPopup = () => {
  return (
    <Popup modal open={true}>
      {(close: () => void) => (
        <Stack
          direction="column"
          rowAlign="center"
          columnAlign="center"
          height={300}
          style={{ margin: 24 }}
        >
          <CloseButton onClick={close}>&times;</CloseButton>
          <Stack
            direction="column"
            rowAlign="center"
            columnAlign="center"
            style={{ margin: 24 }}
          >
            <h2>You're almost done!</h2>
            <p>
              Make sure to update your company logo and homepage so we can link
              users directly to your storefront!
            </p>
          </Stack>
        </Stack>
      )}
    </Popup>
  );
};

function Company(props: CompanyProps) {
  const [companyIndex, setCompanyIndex] = useState(-1);
  const [companies, setCompanies] = useState<Array<BaseCompany>>([]);
  const [updateDepartmentsStatus, setUpdateDepartmentsStatus] = useState({
    error: null as string | null,
    success: false,
  });
  const [updateLogoStatus, setUpdateLogoStatus] = useState({
    error: null as string | null,
    success: false,
  });
  const [updateHomepageStatus, setUpdateHomepageStatus] = useState({
    error: null as string | null,
    success: false,
  });

  const companyId = Cookie.get("companyId");
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const newUser = urlParams.get("newUser");

  useEffect(() => {
    if (companyId === "0") {
      CompanyDAO.getInstance()
        .companies({})
        .then(({ companies }) => {
          setCompanies(companies);
        })
        .catch((err) => console.log(err));
    } else if (companyId) {
      CompanyDAO.getInstance()
        .company({ id: parseInt(companyId) })
        .then(({ company }) => {
          setCompanies([company]);
          setCompanyIndex(0);
        })
        .catch((err) => console.log(err));
    }
  }, [companyId]);

  if (!companyId) {
    return <Redirect to="/signin" />;
  }

  const createCompanyOnClick = (index: number) => {
    return () => {
      setCompanyIndex(index);
      setUpdateLogoStatus({ error: null, success: false });
      setUpdateHomepageStatus({ error: null, success: false });
      setUpdateDepartmentsStatus({ error: null, success: false });
    };
  };

  const onSubmitLogo: FormikConfig<UpdateLogoForm>["onSubmit"] = async (
    values
  ) => {
    let image = values.image;
    try {
      image = await toBase64(image);
    } catch (err) {}

    await CompanyDAO.getInstance()
      .logoUpdate({
        id: companies[companyIndex].id,
        image: image,
      })
      .then(({ error, url }) => {
        if (error) {
          setUpdateLogoStatus({ error: error.message, success: false });
          return;
        }

        companies[companyIndex].logo = url;
        setUpdateLogoStatus({ error: null, success: true });
      })
      .catch((error) => {
        setUpdateLogoStatus({ error: error.message, success: false });
      });
  };

  const onSubmitHomepage: FormikConfig<UpdateHomepageForm>["onSubmit"] = async (
    values
  ) => {
    await CompanyDAO.getInstance()
      .homepageUpdate({
        id: companies[companyIndex].id,
        homepage: values.homepage,
      })
      .then(({ error, homepage }) => {
        if (error) {
          setUpdateHomepageStatus({ error: error.message, success: false });
          return;
        }

        companies[companyIndex].homepage = homepage;
        setUpdateHomepageStatus({ error: null, success: true });
      })
      .catch((error) => {
        setUpdateHomepageStatus({ error: error.message, success: false });
      });
  };

  const onSubmitDepartments: FormikConfig<UpdateDepartmentsForm>["onSubmit"] = async (
    values
  ) => {
    await CompanyDAO.getInstance()
      .departmentsUpdate({
        id: companies[companyIndex].id,
        departments: values.departments.map((department) => department.trim()),
      })
      .then(({ error, departments }) => {
        if (error) {
          setUpdateDepartmentsStatus({ error: error.message, success: false });
          return;
        }

        companies[companyIndex].departments = departments.join(":");
        setUpdateDepartmentsStatus({ error: null, success: true });
      })
      .catch((error) => {
        setUpdateDepartmentsStatus({ error: error.message, success: false });
      });
  };

  return (
    <div>
      {newUser === "true" && <NewUserPopup />}
      <Stack direction="row" columnAlign="flex-start" style={{ marginTop: 12 }}>
        {companyId === "0" && (
          <CompanyList
            createCompanyOnClick={createCompanyOnClick}
            companies={companies}
            height={props.height - 200}
            index={companyIndex}
            width={260}
            style={{ marginRight: 32 }}
          />
        )}
        <Stack direction="column" rowAlign="flex-start" spacing={32}>
          {companyIndex >= 0 && (
            <Stack direction="row" columnAlign="flex-start" spacing={32}>
              <Stack direction="column" rowAlign="flex-start" spacing={32}>
                <div>
                  <FieldLabel>Company</FieldLabel>
                  <FieldValue>{companies[companyIndex].name}</FieldValue>
                </div>
                <div>
                  <FieldLabel>Company Homepage</FieldLabel>
                  <Formik
                    enableReinitialize
                    initialValues={
                      {
                        homepage: companies[companyIndex].homepage,
                      } as UpdateHomepageForm
                    }
                    onSubmit={onSubmitHomepage}
                    validationSchema={UpdateHomepageSchema}
                  >
                    {({
                      isSubmitting,
                      values,
                      handleBlur,
                      handleChange,
                      handleSubmit,
                    }) => (
                      <Form onSubmit={handleSubmit}>
                        <Form.Group>
                          <LocalityForm.InputGroup>
                            <FormControl
                              aria-label="Homepage"
                              aria-details="Replace homepage and click the save button to update"
                              id="homepage"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="e.g. www.cantiqliving.com"
                              type="text"
                              value={values.homepage}
                            />
                          </LocalityForm.InputGroup>
                          <LocalityForm.ErrorMessage name="homepage" />
                        </Form.Group>
                        {updateHomepageStatus.error && (
                          <div style={{ color: "red" }}>
                            {updateHomepageStatus.error}
                          </div>
                        )}
                        {updateHomepageStatus.success && (
                          <div style={{ color: "green" }}>
                            Successfully updated homepage!
                          </div>
                        )}
                        <Stack direction="row-reverse">
                          <LocalityForm.Button
                            isSubmitting={isSubmitting}
                            text="Update"
                            submittingText="Updating..."
                          />
                        </Stack>
                      </Form>
                    )}
                  </Formik>
                </div>
                <div>
                  <FieldLabel>Departments</FieldLabel>
                  <Formik
                    enableReinitialize
                    initialValues={
                      {
                        departments: companies[companyIndex].departments
                          .split(":")
                          .filter(Boolean),
                      } as UpdateDepartmentsForm
                    }
                    onSubmit={onSubmitDepartments}
                    validationSchema={UpdateDepartmentsSchema}
                  >
                    {({
                      isSubmitting,
                      values,
                      handleSubmit,
                      setFieldValue,
                    }) => (
                      <Form onSubmit={handleSubmit}>
                        <Form.Group>
                          <LocalityForm.InputGroup>
                            <Select
                              clearable
                              multi
                              color="#449ed7"
                              onChange={(departments) => {
                                setFieldValue("departments", departments, true);
                              }}
                              options={Departments}
                              style={{ width: 300 }}
                              labelField="name"
                              valueField="name"
                              values={values.departments}
                            />
                          </LocalityForm.InputGroup>
                          <LocalityForm.ErrorMessage name="departments" />
                        </Form.Group>
                        {updateDepartmentsStatus.error && (
                          <div style={{ color: "red" }}>
                            {updateDepartmentsStatus.error}
                          </div>
                        )}
                        {updateDepartmentsStatus.success && (
                          <div style={{ color: "green" }}>
                            Successfully updated departments!
                          </div>
                        )}
                        <Stack direction="row-reverse">
                          <LocalityForm.Button
                            isSubmitting={isSubmitting}
                            text="Update"
                            submittingText="Updating..."
                          />
                        </Stack>
                      </Form>
                    )}
                  </Formik>
                </div>
              </Stack>
              <Stack direction="column" rowAlign="flex-start">
                <FieldLabel>Company Logo</FieldLabel>
                <Formik
                  enableReinitialize
                  initialValues={
                    {
                      image: companies[companyIndex].logo,
                    } as UpdateLogoForm
                  }
                  onSubmit={onSubmitLogo}
                  validationSchema={UpdateLogoSchema}
                >
                  {({
                    isSubmitting,
                    values,
                    handleBlur,
                    handleChange,
                    handleSubmit,
                    setFieldValue,
                  }) => (
                    <Form onSubmit={handleSubmit}>
                      <Image
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        setFieldValue={setFieldValue}
                        alt={companies[companyIndex].name}
                        imageId="image"
                        values={values}
                      />
                      {updateLogoStatus.error && (
                        <div style={{ color: "red" }}>
                          {updateLogoStatus.error}
                        </div>
                      )}
                      {updateLogoStatus.success && (
                        <div style={{ color: "green" }}>
                          Successfully updated logo!
                        </div>
                      )}
                      <Stack direction="row-reverse">
                        <LocalityForm.Button
                          isSubmitting={isSubmitting}
                          text="Update"
                          submittingText="Updating..."
                        />
                      </Stack>
                    </Form>
                  )}
                </Formik>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>
    </div>
  );
}

export default Company;
