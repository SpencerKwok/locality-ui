import React from "react";
import styled from "styled-components";
import Form from "react-bootstrap/Form";
import Popup from "reactjs-popup";
import { ReactComponent as QuestionMark } from "./question_mark.svg";
import "reactjs-popup/dist/index.css";

import Stack from "../../Stack/Stack";

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

function FormLabel(props: FormLabelProps) {
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
}

export default FormLabel;
