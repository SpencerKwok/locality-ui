import { ButtonHTMLAttributes } from "react";
import styled from "styled-components";

import ThemeContext from "components/common/Theme";
import styles from "components/common/button/button.module.css";

import type { FC } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "dark" | "light";
}

const Button: FC<ButtonProps> = ({ children, className, variant, ...rest }) => {
  return (
    <ThemeContext.Consumer>
      {({ color }): JSX.Element => {
        const inverseVariantColor =
          variant === "dark" ? color.text.light : color.text.dark;
        const variantColor =
          variant === "dark" ? color.text.dark : color.text.light;
        const variantFocusColor =
          variant === "dark" ? color.hover.dark : color.hover.light;
        const border = variant === "dark" ? "none" : "";
        const StyledButton = styled.button`
          border: ${border};
          background: ${variantColor};
          color: ${inverseVariantColor};
          &:active {
            background: ${variantFocusColor};
          }
          &:disabled {
            background: ${variantFocusColor};
            cursor: default;
          }
          &:hover {
            background: ${variantFocusColor};
          }
        `;
        return (
          <StyledButton className={`${styles.button} ${className}`} {...rest}>
            {children}
          </StyledButton>
        );
      }}
    </ThemeContext.Consumer>
  );
};

export default Button;
