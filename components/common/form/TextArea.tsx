import styles from "./form.module.css";

import type { FC, HTMLProps } from "react";

export interface FormTextAreaProps extends HTMLProps<HTMLTextAreaElement> {}

const FormTextArea: FC<FormTextAreaProps> = ({ ...rest }) => {
  return <textarea className={styles["input"]} {...rest} />;
};

export default FormTextArea;
