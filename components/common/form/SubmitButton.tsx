import { Fragment } from "react";
import Button from "react-bootstrap/Button";

import styles from "components/common/form/form.module.css";

import type { FC } from "react";
import type { ButtonProps } from "react-bootstrap/Button";

export interface FormSubmitButtonProps extends ButtonProps {
  text: string;
  submittingText: string;
  isSubmitting: boolean;
}

const FormSubmitButton: FC<FormSubmitButtonProps> = ({
  text,
  submittingText,
  isSubmitting,
  disabled,
  ...rest
}) => {
  return (
    <Button
      {...rest}
      className={styles.button}
      type="submit"
      disabled={isSubmitting}
    >
      {isSubmitting === true && disabled !== true ? (
        <Fragment>
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
            style={{ marginBottom: 2, marginRight: 12 }}
          ></span>
          {submittingText}
        </Fragment>
      ) : (
        <Fragment>{text}</Fragment>
      )}
    </Button>
  );
};

export default FormSubmitButton;
