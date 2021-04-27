import React from "react";
import Button from "react-bootstrap/Button";

import styles from "./form.module.css";

export interface FormButtonProps extends React.HTMLProps<HTMLButtonElement> {
  text: string;
  submittingText: string;
  isSubmitting: boolean;
}

export default function FormButton({
  text,
  submittingText,
  isSubmitting,
}: FormButtonProps) {
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
