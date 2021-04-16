import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Cookie from "js-cookie";
import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import { Form, FormControl } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import Popup from "reactjs-popup";
import Select from "react-dropdown-select";

import CompanyList from "../Company";
import Image, { toBase64 } from "../Image";
import CompanyDAO from "./CompanyDAO";
import Stack from "../../../common/components/Stack/Stack";
import { BaseCompany } from "../../../common/rpc/Schema";
import { CloseButton } from "../../../common/components/Popup/Popup";
import {
  FormInputGroup,
  FormButton,
  createFormErrorMessage,
} from "../../../common/components/Form/Form";

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

const DepartmentToId = new Map<string, number>([
  ["Accessories/Jewelry", 1],
  ["Bags", 2],
  ["Baby", 3],
  ["Beauty & Personal Care", 4],
  ["Clothing/Shoes", 5],
  ["Entertainment", 6],
  ["Electronics", 7],
  ["Everything Else/Other", 8],
  ["Fitness", 9],
  ["Food & Drinks", 10],
  ["Groceries", 11],
  ["Health & Personal Care", 12],
  ["Home & Kitchen", 13],
  ["Pet", 14],
  ["Sports & Outdoors", 15],
  ["Toys & Games", 16],
]);

const Departments = [...DepartmentToId.entries()].map((value) => {
  return {
    id: value[1],
    name: value[0],
  };
});

function Company(props: CompanyProps) {
  const companyId = Cookie.get("companyId");
  const [companyIndex, setCompanyIndex] = useState(-1);
  const [companies, setCompanies] = useState<Array<BaseCompany>>([]);
  const [departmentsError, setDepartmentsError] = useState("");
  const [logoError, setLogoError] = useState("");
  const [homepageError, setHomepageError] = useState("");
  const [updatedDepartments, setUpdatedDepartments] = useState(false);
  const [updatedLogo, setUpdatedLogo] = useState(false);
  const [updatedHomepage, setUpdatedHomepage] = useState(false);

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const newUser = urlParams.get("newUser");

  useEffect(() => {
    if (companyId === "0") {
      CompanyDAO.getInstance()
        .companies({})
        .then(({ error, companies }) => {
          if (error) {
            console.log(error);
          } else if (companies) {
            setCompanies(companies);
          }
        })
        .catch((err) => console.log(err));
    } else if (companyId) {
      CompanyDAO.getInstance()
        .company({ id: parseInt(companyId) })
        .then(({ error, company }) => {
          if (error) {
            console.log(error);
          } else if (company) {
            setCompanies([company]);
            setCompanyIndex(0);
          }
        })
        .catch((err) => console.log(err));
    }
  }, []);

  if (!companyId) {
    return <Redirect to="/signin" />;
  }

  const createCompanyOnClick = (index: number) => {
    return () => {
      setCompanyIndex(index);
      setDepartmentsError("");
      setLogoError("");
      setHomepageError("");
      setUpdatedLogo(false);
      setUpdatedHomepage(false);
      setUpdatedDepartments(false);
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
          console.log(error);
          setLogoError(error.message);
        } else if (url) {
          companies[companyIndex].logo = url;
          setUpdatedLogo(true);
          setLogoError("");
        }
      })
      .catch((err) => {
        console.log(err);
        setLogoError(err.message);
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
          console.log(error);
          setHomepageError(error.message);
        } else if (homepage) {
          companies[companyIndex].homepage = values.homepage;
          setUpdatedHomepage(true);
          setHomepageError("");
        }
      })
      .catch((err) => {
        console.log(err);
        setHomepageError(err.message);
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
          console.log(error);
          setDepartmentsError(error.message);
        } else if (departments) {
          companies[companyIndex].departments = departments.join(":");
          setUpdatedDepartments(true);
          setDepartmentsError("");
        }
      })
      .catch((err) => {
        console.log(err);
        setDepartmentsError(err.message);
      });
  };

  return (
    <div>
      {newUser === "true" && (
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
                  Make sure to update your company logo and homepage so we can
                  link users directly to your storefront!
                </p>
              </Stack>
            </Stack>
          )}
        </Popup>
      )}
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
                          <FormInputGroup size="md" width="100%">
                            <FormControl
                              aria-label="Large"
                              id="homepage"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="e.g. www.cantiqliving.com"
                              type="text"
                              value={values.homepage}
                            />
                          </FormInputGroup>
                          {createFormErrorMessage("homepage")}
                        </Form.Group>
                        <div style={{ color: "red" }}>{homepageError}</div>
                        {updatedHomepage && homepageError === "" && (
                          <div style={{ color: "green" }}>
                            Successfully updated homepage!
                          </div>
                        )}
                        <Stack direction="row-reverse">
                          <FormButton
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <React.Fragment>
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                  style={{ marginBottom: 2, marginRight: 12 }}
                                ></span>
                                Saving...
                              </React.Fragment>
                            ) : (
                              <React.Fragment>Save</React.Fragment>
                            )}
                          </FormButton>
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
                          <FormInputGroup size="md" width="100%">
                            <Select
                              clearable
                              multi
                              color="#449ed7"
                              onChange={(departments) => {
                                setFieldValue(
                                  "departments",
                                  departments.map(({ name }) => name),
                                  true
                                );
                              }}
                              options={Departments}
                              style={{ width: 300 }}
                              labelField="name"
                              valueField="name"
                              values={values.departments.map((name) => ({
                                id: DepartmentToId.get(name),
                                name,
                              }))}
                            />
                          </FormInputGroup>
                          {createFormErrorMessage("departments")}
                        </Form.Group>
                        <div style={{ color: "red" }}>{departmentsError}</div>
                        {updatedDepartments && departmentsError === "" && (
                          <div style={{ color: "green" }}>
                            Successfully updated departments!
                          </div>
                        )}
                        <Stack direction="row-reverse">
                          <FormButton
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <React.Fragment>
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                  style={{ marginBottom: 2, marginRight: 12 }}
                                ></span>
                                Saving...
                              </React.Fragment>
                            ) : (
                              <React.Fragment>Save</React.Fragment>
                            )}
                          </FormButton>
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
                      <div style={{ color: "red" }}>{logoError}</div>
                      {updatedLogo && logoError === "" && (
                        <div style={{ color: "green" }}>
                          Successfully updated logo!
                        </div>
                      )}
                      <Stack direction="row-reverse">
                        <FormButton
                          variant="primary"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <React.Fragment>
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                                style={{ marginBottom: 2, marginRight: 12 }}
                              ></span>
                              Saving...
                            </React.Fragment>
                          ) : (
                            <React.Fragment>Save</React.Fragment>
                          )}
                        </FormButton>
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
