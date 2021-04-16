import React from "react";
import styled from "styled-components";
import Button from "react-bootstrap/Button";

// TODO: Use theme
const FormButtonBase = styled(Button)`
  padding: 11px;
  background-color: #449ed7 !important;
  border-color: #449ed7 !important;
  &:hover {
    background-color: #3880ae !important;
    border-color: #3880ae !important;
  }
  &:active {
    background-color: #3880ae !important;
    border-color: #3880ae !important;
  }
`;

export interface FormButtonProps extends React.HTMLProps<HTMLButtonElement> {
  text: string;
  submittingText: string;
  isSubmitting: boolean;
}

function FormButton(props: FormButtonProps) {
  const { text, submittingText, isSubmitting } = props;
  return (
    <FormButtonBase variant="primary" type="submit" disabled={isSubmitting}>
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
    </FormButtonBase>
  );
}

export default FormButton;
