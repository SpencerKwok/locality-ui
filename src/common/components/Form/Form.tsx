import React from "react";
import styled from "styled-components";
import { ErrorMessage } from "formik";
import { Button, InputGroup, Form } from "react-bootstrap";
import Popup from "reactjs-popup";
import { ReactComponent as QuestionMark } from "./question_mark.svg";
import "reactjs-popup/dist/index.css";

import Stack from "../Stack/Stack";

export const FormInputGroup = styled(InputGroup)`
  input:focus {
    box-shadow: none;
  }
  width: ${({ width }) => width}px;
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

const RequiredFormLabel = styled(Form.Label)`
  &:after {
    content: " *";
    color: red;
  }
`;

export interface FormLabelProps extends React.HTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  description?: string;
}

export const FormLabel = (props: FormLabelProps) => {
  const createTooltip = (description: string) => (
    <Popup
      trigger={<QuestionMark width={16} />}
      position="right bottom"
      on={["hover"]}
    >
      {description}
    </Popup>
  );

  if (props.required) {
    return (
      <Stack direction="row" columnAlign="flex-start" spacing={8}>
        <RequiredFormLabel {...props}></RequiredFormLabel>
        {props.description && createTooltip(props.description)}
      </Stack>
    );
  }
  return (
    <Stack direction="row" columnAlign="flex-start" spacing={8}>
      <Form.Label {...props}></Form.Label>
      {props.description && createTooltip(props.description)}
    </Stack>
  );
};
