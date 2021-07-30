import styled from "styled-components";

import FacebookLogo from "components/common/images/FacebookLogo";
import InstagramLogo from "components/common/images/InstagramLogo";
import ThemeContext from "components/common/Theme";
import Stack from "components/common/Stack";
import styles from "./Footer.module.css";

import type { FC } from "react";

// TODO: Make all divs flex
const Div = styled.div`
  display: flex;
`;

interface FooterProps {
  width: number;
}

const Footer: FC<FooterProps> = ({ width }) => {
  const scale = width / 1519;
  const verticalScrollBarWidth =
    window.innerWidth - window.visualViewport.width;
  return (
    <ThemeContext.Consumer>
      {({ color }): JSX.Element => (
        <footer className="top-middle-column" style={{ display: "flex" }}>
          <Div
            className="middle-middle-column"
            style={{
              background: color.background.dark,
              height: 200 * scale,
              width: width - verticalScrollBarWidth,
            }}
          >
            <Stack
              direction="row"
              columnAlign="center"
              rowAlign="center"
              priority={[0, 1, 0]}
              style={{ transform: `scale(${scale})`, width: 1268 }}
            >
              <Stack direction="column" spacing={11}>
                <h1
                  className={styles.h1}
                  style={{ color: color.text.dark, width: 735 }}
                >
                  Support your community and create positive change with your
                  purchase.
                </h1>
                <h2 className={styles.h2} style={{ color: color.text.dark }}>
                  Try us for free on the Chrome store.
                </h2>
              </Stack>
              <div />
              <button
                onClick={(): void => {
                  window.open(
                    "https://chrome.google.com/webstore/detail/locality-local-shopping-m/cklipomamlgjpmihfhfdjmlhnbadnedl",
                    "_blank"
                  );
                }}
                style={{
                  background: color.text.dark,
                  borderRadius: 11,
                  border: "none",
                  color: color.text.light,
                  cursor: "pointer",
                  padding: "20px 24px",
                }}
              >
                Add to Chrome
              </button>
            </Stack>
          </Div>
          <Div
            className="middle-middle-column"
            style={{
              background: color.background.light,
              height: 100 * scale,
              width: width - verticalScrollBarWidth,
            }}
          >
            <Stack
              direction="row"
              columnAlign="center"
              rowAlign="center"
              priority={[0, 1, 0]}
              style={{
                transform: `scale(${scale})`,
                width: 1268,
              }}
            >
              <Stack
                direction="row"
                spacing={33 * scale}
                style={{ transform: `scaleY(${scale})` }}
              >
                <FacebookLogo
                  onClick={(): void => {
                    window.open(
                      "https://www.facebook.com/locality.info",
                      "_blank"
                    );
                  }}
                  style={{
                    cursor: "pointer",
                    transform: `scaleX(${scale})`,
                  }}
                />
                <InstagramLogo
                  onClick={(): void => {
                    window.open(
                      "https://www.instagram.com/mylocality.shop/",
                      "_blank"
                    );
                  }}
                  style={{
                    cursor: "pointer",
                    transform: `scaleX(${scale})`,
                  }}
                />
              </Stack>
              <div />
              <Stack direction="row" rowAlign="center" columnAlign="center">
                <span
                  style={{
                    color: color.text.dark,
                    fontSize: 16 * scale,
                  }}
                >
                  © Copyright 2021 Locality. All Rights Reserved.
                </span>
              </Stack>
            </Stack>
          </Div>
        </footer>
      )}
    </ThemeContext.Consumer>
  );
};

export default Footer;

/*
import styled from "styled-components";

import FacebookLogo from "components/common/images/FacebookLogo";
import InstagramLogo from "components/common/images/InstagramLogo";
import ThemeContext from "components/common/Theme";
import Stack from "components/common/Stack";
import styles from "./Footer.module.css";

import type { FC } from "react";

// TODO: Make all divs flex
const Div = styled.div`
  display: flex;
`;

interface FooterProps {
  width: number;
}

const Footer: FC<FooterProps> = ({ width }) => {
  const scale = width / 1519;
  return (
    <ThemeContext.Consumer>
      {({ color }): JSX.Element => (
        <footer
          className="middle-middle-column"
          style={{
            background: color.background.light,
            display: "flex",
            height: 303 * scale,
            width,
          }}
        >
          <Div
            className="middle-middle-column"
            style={{
              background: color.background.dark,
              transform: `scale(${scale})`,
            }}
          >
            <section
              className={styles.section}
              style={{
                height: 203,
              }}
            >
              <Stack
                direction="row"
                columnAlign="center"
                rowAlign="center"
                priority={[0, 1, 0]}
                style={{ width: 1176 }}
              >
                <Stack direction="column" spacing={11}>
                  <h1
                    className={styles.h1}
                    style={{ color: color.text.dark, width: 735 }}
                  >
                    Support your community and create positive change with your
                    purchase.
                  </h1>
                  <h2 className={styles.h2} style={{ color: color.text.dark }}>
                    Try us for free on the Chrome store.
                  </h2>
                </Stack>
                <div />
                <button
                  onClick={(): void => {
                    window.open(
                      "https://chrome.google.com/webstore/detail/locality-local-shopping-m/cklipomamlgjpmihfhfdjmlhnbadnedl",
                      "_blank"
                    );
                  }}
                  style={{
                    background: color.text.dark,
                    borderRadius: 11,
                    border: "none",
                    color: color.text.light,
                    cursor: "pointer",
                    padding: "20px 24px",
                  }}
                >
                  Add to Chrome
                </button>
              </Stack>
            </section>
            <Stack
              direction="column"
              columnAlign="center"
              rowAlign="center"
              style={{ background: color.background.light }}
            >
              <section className={styles.section}>
                <Stack
                  direction="row"
                  columnAlign="center"
                  rowAlign="center"
                  priority={[0, 1, 0]}
                  style={{
                    height: 100,
                    width: 1268,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={33 * scale}
                    style={{ transform: `scaleY(${scale})` }}
                  >
                    <FacebookLogo
                      onClick={(): void => {
                        window.open(
                          "https://www.facebook.com/locality.info",
                          "_blank"
                        );
                      }}
                      style={{
                        cursor: "pointer",
                        transform: `scaleX(${scale})`,
                      }}
                    />
                    <InstagramLogo
                      onClick={(): void => {
                        window.open(
                          "https://www.instagram.com/mylocality.shop/",
                          "_blank"
                        );
                      }}
                      style={{
                        cursor: "pointer",
                        transform: `scaleX(${scale})`,
                      }}
                    />
                  </Stack>
                  <div />
                  <Stack direction="row" rowAlign="center" columnAlign="center">
                    <span
                      style={{
                        color: color.text.dark,
                        fontSize: 16 * scale,
                      }}
                    >
                      © Copyright 2021 Locality. All Rights Reserved.
                    </span>
                  </Stack>
                </Stack>
              </section>
            </Stack>
          </Div>
        </footer>
      )}
    </ThemeContext.Consumer>
  );
};

export default Footer;

*/
