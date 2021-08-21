import { useEffect, useState } from "react";
import styled from "styled-components";
import { signOut } from "next-auth/client";
import Link from "next/link";

import Button from "components/common/button/Button";
import Chrome from "components/common/images/Chrome";
import ProfilePic from "components/common/images/ProfilePic";
import ThemeContext from "components/common/Theme";
import MiniSearch from "components/search/MiniSearch";
import Stack from "components/common/Stack";
import styles from "components/common/navigation/Navigation.module.css";

import type { FC } from "react";

export type NavigationType = "business" | "none" | "user";
export interface NavigationProps {
  width: number;
  user?: any;
}

// TODO: Make all divs flex
const Div = styled.div`
  display: flex;
`;

const Navigation: FC<NavigationProps> = ({ user, width }) => {
  const [useFallback, setUseFallback] = useState(false);
  const [transitionValue, setTransitionValue] = useState(0);
  const scale = Math.round((width / 1519) * 10) / 10;

  useEffect(() => {
    const onScroll = (): void => {
      const newTransitionValue =
        window.scrollY >= 900 * scale ? 1 : window.scrollY / (900 * scale);
      if (newTransitionValue !== transitionValue) {
        setTransitionValue(newTransitionValue);
      }
    };
    window.addEventListener("scroll", onScroll);
    return (): void => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [transitionValue]);

  return (
    <ThemeContext.Consumer>
      {({ color }): JSX.Element => {
        const startR = parseInt(color.background.light.slice(1, 3), 16);
        const startG = parseInt(color.background.light.slice(3, 5), 16);
        const startB = parseInt(color.background.light.slice(5, 7), 16);
        const r = (255 - startR) * transitionValue + startR;
        const g = (255 - startG) * transitionValue + startG;
        const b = (255 - startB) * transitionValue + startB;

        return (
          <Div
            className="middle-middle-column"
            style={{
              background: `rgb(${r},${g},${b})`,
              height: 100 * scale,
              position: "fixed",
              zIndex: 1,
              width,
            }}
          >
            <nav
              className={styles.nav}
              style={{
                background: `rgb(${r},${g},${b})`,
                width: 1268,
                paddingLeft: 25 * scale,
                transform: `scale(${scale})`,
              }}
            >
              <Div className="middle-middle-row">
                <div style={{ cursor: "pointer", marginRight: 29.75 }}>
                  <Link href="/">
                    <a>
                      <img
                        loading="eager"
                        alt="Locality Logo"
                        src={
                          useFallback
                            ? "https://res.cloudinary.com/hcory49pf/image/upload/v1629522033/home/locality-logo.jpg"
                            : "https://res.cloudinary.com/hcory49pf/image/upload/v1629522033/home/locality-logo.webp"
                        }
                        height={30}
                        width={115}
                        onError={(): void => {
                          if (!useFallback) {
                            setUseFallback(true);
                          }
                        }}
                      />
                    </a>
                  </Link>
                </div>
                <Stack direction="row" rowAlign="center" spacing={22}>
                  <Link href="/#meet-the-team">
                    <a
                      className={styles.link}
                      style={{
                        color: color.text.dark,
                      }}
                    >
                      About us
                    </a>
                  </Link>
                  <Link href="/#partners">
                    <a
                      className={styles.link}
                      style={{
                        color: color.text.dark,
                      }}
                    >
                      Partners
                    </a>
                  </Link>
                  <a
                    href="https://chrome.google.com/webstore/detail/locality-local-shopping-m/cklipomamlgjpmihfhfdjmlhnbadnedl"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      opacity: transitionValue,
                      visibility: transitionValue === 0 ? "hidden" : "visible",
                    }}
                  >
                    <Button
                      variant="dark"
                      style={{
                        padding: "11px 16px",
                      }}
                    >
                      <Stack direction="row" rowAlign="center" spacing={7}>
                        <Chrome width={21} />
                        <span
                          style={{
                            fontSize: 16,
                            fontStyle: "normal",
                            fontWeight: 700,
                          }}
                        >
                          Get Extension
                        </span>
                      </Stack>
                    </Button>
                  </a>
                </Stack>
              </Div>
              <div style={{ flexGrow: 1 }} />
              <Div className="middle-middle-row">
                {((): JSX.Element => {
                  if (user === undefined) {
                    return (
                      <Stack
                        direction="row"
                        spacing={8}
                        rowAlign="center"
                        style={{ paddingRight: 40 }}
                      >
                        <MiniSearch width={247} />
                        <Link href="/signin">
                          <a
                            className={styles.link}
                            style={{
                              color: color.text.dark,
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={8}
                              rowAlign="center"
                              style={{
                                cursor: "pointer",
                              }}
                            >
                              <ProfilePic
                                height={41}
                                width={41}
                                style={{ marginTop: 5 }}
                              />
                              <span>Log in / Register</span>
                            </Stack>
                          </a>
                        </Link>
                      </Stack>
                    );
                  } else {
                    return (
                      <Stack
                        direction="row"
                        spacing={8}
                        rowAlign="center"
                        style={{ paddingRight: 40 }}
                      >
                        <MiniSearch width={247} />
                        <Stack direction="row" spacing={8} rowAlign="center">
                          <ProfilePic
                            height={41}
                            width={41}
                            style={{ marginTop: 5 }}
                          />
                          <span
                            className={styles.link}
                            style={{
                              cursor: "default",
                              color: color.text.dark,
                            }}
                          >{`Hi ${user.firstName} ${user.lastName}!`}</span>
                        </Stack>
                        <Stack
                          className={styles["menu-container"]}
                          direction="column"
                          rowAlign="flex-end"
                        >
                          <div className={styles["menu-button"]}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="30"
                              height="30"
                              viewBox="0 0 30 30"
                            >
                              <path
                                stroke={color.text.dark}
                                stroke-linecap="round"
                                stroke-miterlimit="10"
                                stroke-width="2"
                                d="M4 7h22M4 15h22M4 23h22"
                              />
                            </svg>
                          </div>
                          <Stack
                            className={styles.menu}
                            direction="column"
                            rowAlign="flex-end"
                            style={{
                              background: color.text.light,
                            }}
                          >
                            {user.isBusiness === true && (
                              <Link href="/dashboard">
                                <a
                                  className={styles.link}
                                  style={{
                                    color: color.text.dark,
                                  }}
                                >
                                  Dashboard
                                </a>
                              </Link>
                            )}
                            <Link href="/wishlist">
                              <a
                                className={styles.link}
                                style={{
                                  color: color.text.dark,
                                }}
                              >
                                Wishlist
                              </a>
                            </Link>
                            <span
                              className={styles.link}
                              onClick={async (): Promise<void> => {
                                await signOut({ redirect: false });
                                window.location.assign("/signin");
                              }}
                              style={{
                                color: color.text.dark,
                              }}
                            >
                              Log out
                            </span>
                          </Stack>
                        </Stack>
                      </Stack>
                    );
                  }
                })()}
              </Div>
            </nav>
          </Div>
        );
      }}
    </ThemeContext.Consumer>
  );
};

export default Navigation;
