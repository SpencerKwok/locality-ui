import React from "react";
import { ErrorMessage, ErrorMessageProps } from "formik";

export interface FormErrorMessageProps extends ErrorMessageProps {}

function FormErrorMessage(props: FormErrorMessageProps) {
  const { name } = props;
  return (
    <ErrorMessage
      name={name}
      render={(msg) => <div style={{ color: "red" }}>{msg}</div>}
    />
  );
}

export default FormErrorMessage;
