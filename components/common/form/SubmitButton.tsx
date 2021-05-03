import React from "react";
import Button from "react-bootstrap/button";

import styles from "./form.module.css";

export interface FormSubmitButtonProps
  extends React.HTMLProps<HTMLButtonElement> {
  text: string;
  submittingText: string;
  isSubmitting: boolean;
}

export default function FormSubmitButton({
  text,
  submittingText,
  isSubmitting,
}: FormSubmitButtonProps) {
  return (
    <Button className={styles.button} type="submit" disabled={isSubmitting}>
      {isSubmitting ? (
        <React.Fragment>
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
            style={{ marginBottom: 2, marginRight: 12 }}
          ></span>
          {submittingText}
        </React.Fragment>
      ) : (
        <React.Fragment>{text}</React.Fragment>
      )}
    </Button>
  );
}
