import { useState } from "react";

import Stack from "components/common/Stack";
import ThemeContext from "components/common/Theme";
import styles from "./FaqComponent.module.css";

import type { CSSProperties, FC } from "react";

interface FaqComponentProps {
  style?: CSSProperties;
  question: string;
  answer: Array<JSX.Element | string>;
}

const FaqComponent: FC<FaqComponentProps> = ({ style, question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <ThemeContext.Consumer>
      {({}): JSX.Element => (
        <Stack direction="column" style={style}>
          <Stack direction="column" className={styles["faq-component"]}>
            <Stack
              direction="row"
              columnAlign="center"
              rowAlign="center"
              priority={[0, 1, 0]}
              onClick={(): void => {
                setOpen(!open);
              }}
            >
              <div className={styles["faq-text"]}>{question}</div>
              <div />
              <svg
                focusable={false}
                viewBox="0 0 256 512"
                style={{
                  height: 16,
                  width: 12,
                  ...(open ? { transform: "rotate(90deg)" } : {}),
                }}
              >
                <path
                  fill="currentColor"
                  d="M24.707 38.101L4.908 57.899c-4.686 4.686-4.686 12.284 0 16.971L185.607 256 4.908 437.13c-4.686 4.686-4.686 12.284 0 16.971L24.707 473.9c4.686 4.686 12.284 4.686 16.971 0l209.414-209.414c4.686-4.686 4.686-12.284 0-16.971L41.678 38.101c-4.687-4.687-12.285-4.687-16.971 0z"
                ></path>
              </svg>
            </Stack>
            {open && (
              <Stack direction="column" spacing={12} style={{ marginTop: 24 }}>
                {answer.map((line) => (
                  <div>{line}</div>
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      )}
    </ThemeContext.Consumer>
  );
};

export default FaqComponent;
