import { ErrorMessage, ErrorMessageProps } from "formik";

import type { FC, ReactNode } from "react";

export type FormErrorMessageProps = ErrorMessageProps;

const FormErrorMessage: FC<FormErrorMessageProps> = ({ name }) => {
  return (
    <ErrorMessage
      name={name}
      render={(msg): ReactNode => <div style={{ color: "red" }}>{msg}</div>}
    />
  );
};

export default FormErrorMessage;
