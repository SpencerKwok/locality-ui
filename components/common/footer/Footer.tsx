import Image from "next/image";
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
  const scale = Math.round((width / 1519) * 10) / 10;
  return (
    <ThemeContext.Consumer>
      {({ color }): JSX.Element => (
        <footer className="top-middle-column" style={{ display: "flex" }}>
          <Div
            className="middle-middle-column"
            style={{
              background: color.background.dark,
              height: 200 * scale,
              width,
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
                  className={styles.bold}
                  style={{ color: color.text.dark, width: 735 }}
                >
                  Support your community and create positive change with your
                  purchase.
                </h1>
                <h2 style={{ color: color.text.dark }}>
                  Try us for free on the Chrome store.
                </h2>
              </Stack>
              <div />
              <Stack
                direction="row"
                columnAlign="center"
                rowAlign="center"
                spacing={22}
              >
                <a
                  href="https://chrome.google.com/webstore/detail/locality-local-shopping-m/cklipomamlgjpmihfhfdjmlhnbadnedl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button
                    style={{
                      background: color.text.dark,
                      borderRadius: 11,
                      border: "none",
                      color: color.text.light,
                      cursor: "pointer",
                      padding: "20px 24px",
                      marginBottom: 72,
                    }}
                  >
                    Add to Chrome
                  </button>
                </a>
                <div
                  style={{
                    height: 200,
                    overflow: "hidden",
                  }}
                >
                  <Image
                    alt="Hand holding a rose"
                    layout="fixed"
                    src="https://res.cloudinary.com/hcory49pf/image/upload/v1628294359/home/rose-hand.webp"
                    width={256}
                    height={338}
                  />
                </div>
              </Stack>
            </Stack>
          </Div>
          <Div
            className="middle-middle-column"
            style={{
              background: color.background.light,
              height: 100 * scale,
              width,
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
                <a
                  href="https://www.facebook.com/locality.info"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FacebookLogo
                    style={{
                      transform: `scaleX(${scale})`,
                    }}
                  />
                </a>
                <a
                  href="https://www.instagram.com/mylocality.shop"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramLogo
                    style={{
                      transform: `scaleX(${scale})`,
                    }}
                  />
                </a>
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
