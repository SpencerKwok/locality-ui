import styles from "./form.module.css";

import type { FC, HTMLProps } from "react";

export type FormInputProps = HTMLProps<HTMLInputElement>;

const FormInputGroup: FC<FormInputProps> = ({ children, ...rest }) => {
  return (
    <input className={styles.input} {...rest}>
      {children}
    </input>
  );
};

export default FormInputGroup;
