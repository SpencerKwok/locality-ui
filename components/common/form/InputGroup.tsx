import InputGroup, { InputGroupProps } from "react-bootstrap/InputGroup";

import type { FC } from "react";

export type FormInputGroupProps = InputGroupProps;

const FormInputGroup: FC<FormInputGroupProps> = ({
  children,
  ...rest
}: FormInputGroupProps) => {
  return <InputGroup {...rest}>{children}</InputGroup>;
};

export default FormInputGroup;
