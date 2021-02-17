import React from "react";
import styled from "styled-components";
import { ErrorMessage } from "formik";
import { Button, InputGroup, Form } from "react-bootstrap";

export const FormInputGroup = styled(InputGroup)`
  input:focus {
    box-shadow: none;
  }
  width: ${({ width }) => width}px;
`;

export const FormLabel = styled(Form.Label)`
  &:after {
    content: " *";
    color: red;
  }
`;

export const FormButton = styled(Button)`
  padding: 11px;
  background-color: #449ed7 !important;
  border-color: #449ed7 !important;
  &:hover {
    background-color: #3880ae !important;
    border-color: #3880ae !important;
  }
  &:active {
    background-color: #3880ae !important;
    border-color: #3880ae !important;
  }
`;

export const createFormErrorMessage = (name: string) => {
  return (
    <div style={{ color: "red" }}>
      <ErrorMessage name={name} />
    </div>
  );
};
