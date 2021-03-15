import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Cookie from "js-cookie";
import * as yup from "yup";
import { Formik, FormikConfig } from "formik";
import { Form, FormControl } from "react-bootstrap";
import { Redirect } from "react-router-dom";

import CompanyList from "../Company";
import Image, { toBase64 } from "../Image";
import CompanyDAO from "./CompanyDAO";
import Stack from "../../../common/components/Stack/Stack";
import { BaseCompany } from "../../../common/rpc/Schema";
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

const UpdateLogoSchema = yup.object().shape({
  image: yup.mixed().test("Defined", "Required", (value) => {
    return value !== undefined && value !== "";
  }),
});

const UpdateHomepageSchema = yup.object().shape({
  homepage: yup.string().required("Required").max(255, "Too long"),
});

function Company(props: CompanyProps) {
  const companyId = Cookie.get("companyId");
  const [companyIndex, setCompanyIndex] = useState(-1);
  const [companies, setCompanies] = useState<Array<BaseCompany>>([]);
  const [logoError, setLogoError] = useState("");
  const [homepageError, setHomepageError] = useState("");
  const [updatedLogo, setUpdatedLogo] = useState(false);
  const [updatedHomepage, setUpdatedHomepage] = useState(false);

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
      setLogoError("");
      setHomepageError("");
      setUpdatedLogo(false);
      setUpdatedHomepage(false);
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
      .then(({ error }) => {
        if (error) {
          console.log(error);
          setHomepageError(error.message);
        } else {
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

  return (
    <Stack
      direction="row"
      columnAlign="flex-start"
      style={{ marginTop: 12 }}
      spacing={32}
    >
      {companyId === "0" && (
        <CompanyList
          createCompanyOnClick={createCompanyOnClick}
          companies={companies}
          height={props.height - 200}
          index={companyIndex}
          width={Math.min(props.width * 0.2, 230)}
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
                  initialValues={
                    {
                      homepage: companies[companyIndex].homepage,
                    } as UpdateHomepageForm
                  }
                  onSubmit={onSubmitHomepage}
                  validationSchema={UpdateHomepageSchema}
                  enableReinitialize={true}
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
            </Stack>
            <Stack direction="column" rowAlign="flex-start">
              <FieldLabel>Company Logo</FieldLabel>
              <Formik
                initialValues={
                  {
                    image: companies[companyIndex].logo,
                  } as UpdateLogoForm
                }
                onSubmit={onSubmitLogo}
                validationSchema={UpdateLogoSchema}
                enableReinitialize={true}
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
  );
}

export default Company;
