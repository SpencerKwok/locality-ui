import { useEffect, useState } from "react";
import Link from "next/link";

import ProfilePic from "components/common/images/ProfilePic";
import ThemeContext from "components/common/Theme";
import Stack from "components/common/Stack";
import styles from "components/common/navigation/NavigationMobile.module.css";

import type { FC } from "react";

export type NavigationType = "business" | "none" | "user";
export interface NavigationProps {}

const Navigation: FC<NavigationProps> = ({}) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [transitionValue, setTransitionValue] = useState(0);

  useEffect(() => {
    const onScroll = (): void => {
      const newTransitionValue =
        window.scrollY >= 800 ? 1 : window.scrollY / 800;
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
          <nav
            className={styles.nav}
            style={{
              background: `rgb(${r},${g},${b})`,
              position: "fixed",
              zIndex: 1,
              height: 35,
              width: "100%",
            }}
          >
            <Stack
              direction="row"
              columnAlign="center"
              rowAlign="flex-start"
              priority={[0, 1, 0, 0]}
              style={{ width: "90%" }}
            >
              <Link href="/">
                <a
                  onClick={(): void => {
                    window.dispatchEvent(new Event("hashchange"));
                  }}
                  style={{ cursor: "pointer" }}
                >
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
                    style={{ marginTop: 4 }}
                    onError={(): void => {
                      if (!useFallback) {
                        setUseFallback(true);
                      }
                    }}
                  />
                </a>
              </Link>
              <div />
              <Stack direction="column" rowAlign="flex-end">
                <Stack
                  direction="row"
                  spacing={12}
                  columnAlign="center"
                  rowAlign="center"
                  style={{ marginTop: -8 }}
                >
                  <Link href="/signin">
                    <a>
                      <ProfilePic
                        height={41}
                        width={41}
                        style={{ marginTop: 7 }}
                      />
                    </a>
                  </Link>{" "}
                  <div
                    className={styles["menu-button"]}
                    onClick={(): void => {
                      setOpenMenu(!openMenu);
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
                        strokeLinecap="round"
                        strokeMiterlimit="10"
                        strokeWidth="2"
                        d="M4 7h22M4 15h22M4 23h22"
                      />
                    </svg>
                  </div>
                </Stack>
                <Stack
                  className={styles.menu}
                  direction="column"
                  style={{
                    background: color.text.light,
                    visibility: openMenu ? "visible" : "hidden",
                    marginTop: 6,
                  }}
                >
                  <Link href="/#how-it-works">
                    <a
                      className={styles.link}
                      onClick={(): void => {
                        window.dispatchEvent(new Event("hashchange"));
                      }}
                      style={{
                        color: color.text.dark,
                      }}
                    >
                      How it works
                    </a>
                  </Link>
                  <Link href="/#explore-goodies">
                    <a
                      className={styles.link}
                      onClick={(): void => {
                        window.dispatchEvent(new Event("hashchange"));
                      }}
                      style={{
                        color: color.text.dark,
                      }}
                    >
                      Explore goodies
                    </a>
                  </Link>
                  <Link href="/#our-partners">
                    <a
                      className={styles.link}
                      onClick={(): void => {
                        window.dispatchEvent(new Event("hashchange"));
                      }}
                      style={{
                        color: color.text.dark,
                      }}
                    >
                      Our partners
                    </a>
                  </Link>
                  <Link href="/#meet-the-team">
                    <a
                      className={styles.link}
                      onClick={(): void => {
                        window.dispatchEvent(new Event("hashchange"));
                      }}
                      style={{
                        color: color.text.dark,
                      }}
                    >
                      Meet the team
                    </a>
                  </Link>
                </Stack>
              </Stack>
            </Stack>
          </nav>
        );
      }}
    </ThemeContext.Consumer>
  );
};

export default Navigation;
