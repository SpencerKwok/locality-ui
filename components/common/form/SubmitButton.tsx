import Button from "components/common/button/Button";
import Stack from "components/common/Stack";
import styles from "components/common/form/form.module.css";

import type { FC, HTMLAttributes } from "react";

export interface FormSubmitButtonProps
  extends HTMLAttributes<HTMLButtonElement> {
  text: string;
  submittingText: string;
  isSubmitting: boolean;
  disabled?: boolean;
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
      variant="dark"
      type="submit"
      disabled={disabled}
    >
      {isSubmitting === true && disabled !== true ? (
        <Stack direction="row" rowAlign="center" columnAlign="center">
          <span
            className={`${styles["spinner-border"]} ${styles["spinner-border-sm"]}`}
            role="status"
            aria-hidden="true"
            style={{ marginRight: 12 }}
          ></span>
          {submittingText}
        </Stack>
      ) : (
        <Stack
          direction="row"
          rowAlign="center"
          columnAlign="center"
          style={{ height: 18 }}
        >
          {text}
        </Stack>
      )}
    </Button>
  );
};

export default FormSubmitButton;
