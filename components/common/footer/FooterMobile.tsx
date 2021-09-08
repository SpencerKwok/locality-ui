import FacebookLogo from "components/common/images/FacebookLogo";
import InstagramLogo from "components/common/images/InstagramLogo";
import ThemeContext from "components/common/Theme";
import Stack from "components/common/Stack";
import styles from "./Footer.module.css";

import type { FC } from "react";

interface FooterProps {}

const Footer: FC<FooterProps> = ({}) => {
  return (
    <ThemeContext.Consumer>
      {({ color }): JSX.Element => (
        <footer className="top-middle-column">
          <Stack
            direction="column"
            spacing={11}
            style={{
              background: color.background.dark,
              padding: "5%",
              width: "90%",
            }}
          >
            <Stack
              direction="column"
              columnAlign="center"
              rowAlign="center"
              spacing={11}
              style={{
                width: "100%",
              }}
            >
              <h1 className={styles.bold} style={{ color: color.text.dark }}>
                Support your community and create positive change with your
                purchase.
              </h1>
              <h2 style={{ color: color.text.dark }}>
                Try us for free on the Chrome store.
              </h2>
            </Stack>
          </Stack>
          <Stack
            direction="column"
            spacing={11}
            style={{
              background: color.background.light,
              padding: "5%",
              width: "90%",
            }}
          >
            <Stack
              direction="row"
              spacing={24}
              priority={[0, 0, 1, 0]}
              style={{
                width: "100%",
              }}
            >
              <a
                href="https://www.facebook.com/locality.info"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookLogo />
              </a>
              <a
                href="https://www.instagram.com/mylocality.shop"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramLogo />
              </a>
              <div />
              <div>© Copyright 2021 Locality</div>
            </Stack>
          </Stack>
        </footer>
      )}
    </ThemeContext.Consumer>
  );
};

export default Footer;
