import React, { useState, useEffect } from "react";
import XSS from "xss";
import * as yup from "yup";
import styled from "styled-components";
import { Formik, FormikConfig } from "formik";
import { Form, ListGroup } from "react-bootstrap";
import { Button, InputGroup, FormControl, FormLabel } from "react-bootstrap";
import { List } from "react-virtualized";

import Stack from "../../../common/components/Stack/Stack";
import {
  SearchInputGroup,
  SearchClearButton,
  SearchSubmitButton,
} from "../../../common/components/Search/Search";
import {
  FormInputGroup,
  FormButton,
  createFormErrorMessage,
} from "../../../common/components/Form/Form";

export interface CompanyProps extends React.HTMLProps<HTMLDivElement> {
  width: number;
  height: number;
}

interface FormRequest {
  company: string;
}

const FormSchema = yup.object().shape({
  company: yup.string().max(255, "Too long"),
});

function Company(props: CompanyProps) {
  const onSubmit: FormikConfig<FormRequest>["onSubmit"] = async (values) => {};
  const [curIndex, setCurIndex] = useState(0);

  useEffect(() => {}, []);

  const list = Array(100)
    .fill(0)
    .map((val, idx) => {
      return {
        id: idx,
        name: "John Doe",
      };
    });

  return (
    <Stack direction="column" rowAlign="flex-start">
      <Formik
        initialValues={
          {
            company: "",
          } as FormRequest
        }
        onSubmit={onSubmit}
        validationSchema={FormSchema}
      >
        {({ isSubmitting, values, handleBlur, handleChange, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <FormLabel>Company</FormLabel>
              <Stack direction="row" columnAlign="flex-start">
                <div style={{ display: "flex", width: props.width * 0.3 }}>
                  <SearchInputGroup
                    size="lg"
                    style={{ border: "1px solid #ced4da", flexGrow: 1 }}
                  >
                    <FormControl
                      aria-label="Large"
                      aria-describedby="inputGroup-sizing-sm"
                      id="company"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      style={{ border: "none" }}
                      type="text"
                      value={values.company}
                    />
                    {values.company.length > 0 && (
                      <InputGroup.Append>
                        <SearchClearButton
                          className="close"
                          onClick={() => (values.company = "")}
                        >
                          ×
                        </SearchClearButton>
                      </InputGroup.Append>
                    )}
                  </SearchInputGroup>
                  <SearchSubmitButton variant="primary" style={{ flexGrow: 0 }}>
                    Search
                  </SearchSubmitButton>
                </div>
              </Stack>
              {createFormErrorMessage("company")}
            </Form.Group>
          </Form>
        )}
      </Formik>
      <List
        width={props.width * 0.3}
        height={props.height * 0.7}
        rowHeight={48}
        rowRenderer={({ index, key, style }) => {
          return (
            <div key={key} style={style}>
              {curIndex === index ? (
                <ListGroup.Item active onClick={() => setCurIndex(index)}>
                  {index}
                </ListGroup.Item>
              ) : (
                <ListGroup.Item onClick={() => setCurIndex(index)}>
                  {index}
                </ListGroup.Item>
              )}
            </div>
          );
        }}
        rowCount={list.length}
      />
    </Stack>
  );
}

export default Company;
