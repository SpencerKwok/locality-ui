import React from "react";
import Form from "react-bootstrap/Form";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import QuestionMark from "components/common/images/QuestionMark";
import Stack from "components/common/Stack";
import styles from "components/common/form/form.module.css";

export interface FormLabelProps extends React.HTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  description?: string;
}

export default function FormLabel({
  required,
  className,
  description,
  ...rest
}: FormLabelProps) {
  const createTooltip = (description: string) => (
    <Popup
      trigger={
        <div>
          <QuestionMark width={16} />
        </div>
      }
      position="right bottom"
      on={["hover"]}
    >
      {description}
    </Popup>
  );

  const finalClassName = required
    ? `${className || ""} ${styles.label}`
    : `${className || ""}`;
  return (
    <Stack direction="row" columnAlign="flex-start" spacing={8}>
      <Form.Label className={finalClassName} {...rest}></Form.Label>
      {description && createTooltip(description)}
    </Stack>
  );
}
