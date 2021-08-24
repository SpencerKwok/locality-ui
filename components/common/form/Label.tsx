import Form from "react-bootstrap/Form";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import QuestionMark from "components/common/images/QuestionMark";
import Stack from "components/common/Stack";
import styles from "components/common/form/form.module.css";

import type { FC, ReactElement } from "react";

export interface FormLabelProps extends React.HTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  description?: string;
}

const FormLabel: FC<FormLabelProps> = ({
  required,
  className,
  description,
  ...rest
}) => {
  const createTooltip = (description: string): ReactElement => (
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

  const finalClassName =
    required === true
      ? `${className ?? ""} ${styles["label-required"]}`
      : `${className ?? ""} ${styles.label}`;
  return (
    <Stack direction="row" columnAlign="flex-start" spacing={8}>
      <Form.Label className={finalClassName} {...rest}></Form.Label>
      {typeof description === "string" &&
        description &&
        createTooltip(description)}
    </Stack>
  );
};

export default FormLabel;
