import { forwardRef, useState } from "react";
import styled from "styled-components";
import { signOut } from "next-auth/client";
import Link from "next/link";

import LocalityLogo from "components/common/images/LocalityLogo";
import ProfilePic from "components/common/images/ProfilePic";
import ThemeContext from "components/common/Theme";
import MiniSearch from "components/search/MiniSearch";
import Stack from "components/common/Stack";
import styles from "components/common/navigation/Navigation.module.css";

import type { FC, SVGProps } from "react";

export type NavigationType = "business" | "none" | "user";
export interface NavigationProps {
  width: number;
  user?: any;
}

// TODO: Make all divs flex
const Div = styled.div`
  display: flex;
`;

// LocalityLogo + ProfilePic is a functional component that
// doesn't use ref so we leave it out using a wrapper
const LocalityLogoWrapper = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
    void ref;
    return <LocalityLogo {...props} />;
  }
);
const ProfilePicWrapper = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
    void ref;
    return <ProfilePic {...props} />;
  }
);

const Navigation: FC<NavigationProps> = ({ user, width }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const scale = width / 1519;
  return (
    <ThemeContext.Consumer>
      {({ color }): JSX.Element => (
        <Div
          className="middle-middle-column"
          style={{
            background: color.background.light,
            height: 100 * scale,
            width,
          }}
        >
          <nav
            className={styles.nav}
            style={{
              background: color.background.light,
              width: 1268,
              paddingLeft: 25 * scale,
              position: "relative",
              zIndex: 1,
              transform: `scale(${scale})`,
            }}
          >
            <Div className="middle-middle-row">
              <div style={{ cursor: "pointer", marginRight: 29.75 }}>
                <Link href="/">
                  <LocalityLogoWrapper height={40} width={121.5} />
                </Link>
              </div>
              <Stack direction="row" spacing={22}>
                <Link href="/#meet-the-team">
                  <span
                    className={styles.span}
                    style={{
                      color: color.text.dark,
                      cursor: "pointer ",
                    }}
                  >
                    About us
                  </span>
                </Link>
                <Link href="/#partners">
                  <span
                    className={styles.span}
                    style={{
                      color: color.text.dark,
                      cursor: "pointer ",
                    }}
                  >
                    Partners
                  </span>
                </Link>
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
                        <Stack
                          direction="row"
                          spacing={8}
                          rowAlign="center"
                          style={{
                            cursor: "pointer",
                          }}
                        >
                          <ProfilePicWrapper
                            height={41}
                            width={41}
                            style={{ marginTop: 5 }}
                          />
                          <span
                            className={styles.span}
                            style={{
                              color: color.text.dark,
                            }}
                          >
                            Log in / Register
                          </span>
                        </Stack>
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
                        <Link href="/signin">
                          <Stack
                            direction="row"
                            spacing={8}
                            rowAlign="center"
                            style={{
                              cursor: "pointer",
                            }}
                          >
                            <ProfilePicWrapper
                              height={41}
                              width={41}
                              style={{ marginTop: 5 }}
                            />
                            <span
                              className={styles.span}
                              style={{
                                color: color.text.dark,
                              }}
                            >
                              {`Hi ${user.firstName} ${user.lastName}!`}
                            </span>
                          </Stack>
                        </Link>
                      </Stack>
                      <Stack direction="column" rowAlign="flex-end">
                        <button
                          onClick={(): void => {
                            setMenuVisible(!menuVisible);
                          }}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            marginTop: 1,
                          }}
                        >
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
                        </button>
                        <Stack
                          direction="column"
                          rowAlign="flex-end"
                          style={{
                            borderRadius: 11,
                            background: color.text.light,
                            padding: "6px 12px 6px 12px",
                            position: "absolute",
                            visibility: menuVisible ? "visible" : "hidden",
                            overflow: "visible",
                            right: 42,
                          }}
                        >
                          {user.isBusiness === true && (
                            <Link href="/dashboard">
                              <span
                                className={styles.span}
                                style={{
                                  color: color.text.dark,
                                  cursor: "pointer",
                                }}
                              >
                                Dashboard
                              </span>
                            </Link>
                          )}
                          <Link href="/wishlist">
                            <span
                              className={styles.span}
                              style={{
                                color: color.text.dark,
                                cursor: "pointer",
                              }}
                            >
                              Wishlist
                            </span>
                          </Link>
                          <span
                            className={styles.span}
                            onClick={async (): Promise<void> => {
                              await signOut({ redirect: false });
                              window.location.assign("/signin");
                            }}
                            style={{
                              color: color.text.dark,
                              cursor: "pointer",
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
      )}
    </ThemeContext.Consumer>
  );
};

export default Navigation;
