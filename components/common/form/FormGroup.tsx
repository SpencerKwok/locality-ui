import styles from "./form.module.css";

import type { CSSProperties, FC } from "react";

export interface FormGroup {
  style?: CSSProperties;
}

const FormInputGroup: FC<FormGroup> = ({ children, ...rest }) => {
  return (
    <div className={styles["form-group"]} {...rest}>
      {children}
    </div>
  );
};

export default FormInputGroup;
