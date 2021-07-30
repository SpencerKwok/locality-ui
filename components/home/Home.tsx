import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import styled from "styled-components";
import Link from "next/link";

import AddToChrome from "components/common/images/AddToChrome";
import StepArrow from "components/common/images/StepArrow";
import MiniSearch from "components/search/MiniSearch";
import ThemeContext from "components/common/Theme";
import Stack from "components/common/Stack";
import Values from "components/common/images/Values";
import styles from "./Home.module.css";

import type { FC } from "react";

// TODO: Make all divs flex
const Div = styled.div`
  display: flex;
`;

const ExploreLocalGoodiesPlaceholder = dynamic(
  async () => import("components/common/images/ExploreLocalGoodiesPlaceholder")
);
const OurPartnersPlaceholder = dynamic(
  async () => import("components/common/images/OurPartnersPlaceholder")
);
const NewUser = dynamic(async () => import("components/common/popups/NewUser"));

interface HomeProps {
  isNewUser: boolean;
  width: number;
}

const Home: FC<HomeProps> = ({ isNewUser, width }) => {
  const [playSteps, setPlaySteps] = useState(true);
  const [howItWorksStep, setHowItWorksStep] = useState(1);
  const scale = width / 1519;
  useEffect(() => {
    if (playSteps) {
      const intervalTimer = setInterval(() => {
        setHowItWorksStep((howItWorksStep % 3) + 1);
      }, 5000);

      return (): void => {
        clearInterval(intervalTimer);
      };
    }
  }, [howItWorksStep, playSteps]);

  return (
    <ThemeContext.Consumer>
      {({ color }): JSX.Element => (
        <Div className="top-middle-column">
          {isNewUser && <NewUser />}
          <Div className="top-middle-column">
            <section
              className="middle-middle-column"
              style={{
                background: color.background.light,
                height: 800 * scale,
                width,
              }}
            >
              <Div
                className="middle-middle-row"
                style={{
                  transform: `scale(${scale})`,
                }}
              >
                <Div className="middle-left-column">
                  <h1
                    style={{
                      color: color.text.dark,
                      marginBottom: 24,
                      width: 582,
                    }}
                  >
                    Your Online Marketplace for High Quality Local Products
                  </h1>
                  <h2
                    style={{
                      color: color.text.dark,
                      marginBottom: 24,
                      width: 504,
                    }}
                  >
                    Explore local offerings and support local businesses
                  </h2>
                  <button
                    className={styles.button}
                    onClick={(): void => {
                      window.open(
                        "https://chrome.google.com/webstore/detail/locality-local-shopping-m/cklipomamlgjpmihfhfdjmlhnbadnedl",
                        "_blank"
                      );
                    }}
                    style={{
                      background: color.text.dark,
                      color: color.text.light,
                    }}
                  >
                    <AddToChrome />
                  </button>
                </Div>
                <img
                  alt="Locality Extension Demo"
                  src="images/locality-extension.png"
                  width={848 * 0.8}
                  height={676 * 0.8}
                  style={{
                    maxWidth: 848 * 0.8,
                  }}
                />
              </Div>
            </section>
            <section
              className="middle-middle-column"
              style={{
                background: color.background.dark,
                height: 800 * scale,
                width,
              }}
            >
              <Div
                className="middle-middle-row"
                style={{
                  transform: `scale(${scale})`,
                }}
              >
                <Div
                  className="middle-left-column"
                  style={{ width: 412, marginRight: 172 }}
                >
                  <h1 style={{ color: color.text.dark, marginBottom: 24 }}>
                    How it works
                  </h1>
                  <h3 style={{ color: color.text.dark, marginBottom: 24 }}>
                    We make it effortless to shop local
                    <br />- It's as easy as 1, 2, 3
                  </h3>
                  <Stack
                    direction="row"
                    rowAlign="center"
                    style={{ cursor: "pointer" }}
                    onClick={(): void => {
                      setPlaySteps(false);
                      setHowItWorksStep(1);
                    }}
                  >
                    <StepArrow
                      {...(howItWorksStep !== 1 && { visibility: "hidden" })}
                    />
                    <Div
                      className={styles["step-number"]}
                      style={{
                        color: color.text.dark,
                        ...(howItWorksStep === 1 && { fontWeight: 700 }),
                      }}
                    >
                      1
                    </Div>
                    <h3
                      className={
                        howItWorksStep === 1 ? styles["step-wrapper"] : ""
                      }
                      style={{
                        color: color.text.dark,
                        marginLeft: 36,
                        marginTop: -5,
                        ...(howItWorksStep === 1
                          ? {
                              fontWeight: 700,
                            }
                          : { paddingLeft: 16 }),
                      }}
                    >
                      Add to Chrome
                    </h3>
                  </Stack>
                  <Stack
                    direction="row"
                    rowAlign="center"
                    style={{ cursor: "pointer" }}
                    onClick={(): void => {
                      setPlaySteps(false);
                      setHowItWorksStep(2);
                    }}
                  >
                    <StepArrow
                      {...(howItWorksStep !== 2 && { visibility: "hidden" })}
                    />
                    <Div
                      className={styles["step-number"]}
                      style={{
                        color: color.text.dark,
                        ...(howItWorksStep === 2 && { fontWeight: 700 }),
                      }}
                    >
                      2
                    </Div>
                    <h3
                      className={
                        howItWorksStep === 2 ? styles["step-wrapper"] : ""
                      }
                      style={{
                        color: color.text.dark,
                        marginLeft: 36,
                        marginTop: -5,
                        ...(howItWorksStep === 2
                          ? {
                              fontWeight: 700,
                            }
                          : { paddingLeft: 16 }),
                      }}
                    >
                      Shop as usual on big box retailers
                    </h3>
                  </Stack>
                  <Stack
                    direction="row"
                    rowAlign="center"
                    style={{ cursor: "pointer" }}
                    onClick={(): void => {
                      setPlaySteps(false);
                      setHowItWorksStep(3);
                    }}
                  >
                    <StepArrow
                      {...(howItWorksStep !== 3 && { visibility: "hidden" })}
                    />
                    <Div
                      className={styles["step-number"]}
                      style={{
                        color: color.text.dark,
                        ...(howItWorksStep === 3 && { fontWeight: 700 }),
                      }}
                    >
                      3
                    </Div>
                    <h3
                      className={
                        howItWorksStep === 3 ? styles["step-wrapper"] : ""
                      }
                      style={{
                        color: color.text.dark,
                        marginLeft: 36,
                        marginTop: -5,
                        ...(howItWorksStep === 3
                          ? {
                              fontWeight: 700,
                            }
                          : { paddingLeft: 16 }),
                      }}
                    >
                      We'll find the local products for you
                    </h3>
                  </Stack>
                </Div>
                <Div className="middle-middle-column">
                  <Div
                    className={styles["step-image"]}
                    style={{ width: 680, marginBottom: 24 }}
                  />
                  <h3 className={styles.h3} style={{ color: color.text.dark }}>
                    {((): string => {
                      switch (howItWorksStep) {
                        case 1:
                          return "Adding Locality to your chrome browser takes 1 second and is 100% free";
                        case 2:
                          return "Locality will activate on platforms like Amazon, Etsy, and Walmart";
                        case 3:
                          return "We’ll search for the same product in your area, saving you time and hopefully money too!";
                      }
                      return "";
                    })()}
                  </h3>
                </Div>
              </Div>
            </section>
            <section
              className="middle-middle-column"
              style={{
                background: color.background.light,
                height: 800 * scale,
                width,
              }}
            >
              <Div
                className="middle-middle-column"
                style={{
                  transform: `scale(${scale})`,
                }}
              >
                <Div
                  className="middle-left-column"
                  style={{ marginBottom: 58 }}
                >
                  <h1 style={{ color: color.text.dark, marginBottom: 24 }}>
                    Explore local goodies
                  </h1>
                  <Div style={{ width: 1268 }}>
                    <h3
                      className={styles.h3}
                      style={{
                        color: color.text.dark,
                        paddingLeft: 3,
                        width: 448,
                      }}
                    >
                      We care about creating meaningful impact in our
                      communities. Each of your purchases promotes positive
                      social, economical, and environmental change.
                    </h3>
                    <Div style={{ flexGrow: 1 }} />
                    <Div className="middle-middle-row">
                      <Div
                        className="middle-middle-row"
                        style={{ marginRight: 32 }}
                      >
                        <h3
                          className={styles.h3}
                          style={{
                            color: color.text.dark,
                            fontWeight: 700,
                            marginRight: 6,
                          }}
                        >
                          Browse more
                        </h3>
                        <svg
                          width={12}
                          height={11}
                          viewBox="0 0 12 11"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.7629 5.27283L11.4324 4.95608L11.1953 4.72891L6.26043 0L5.45576 0.771088L9.8197 4.95608H0V6.04392H9.8197L5.45576 10.2289L6.26043 11L12 5.5L11.7629 5.27283Z"
                            fill="#112378"
                          />
                        </svg>
                      </Div>
                      <MiniSearch width={247} />
                    </Div>
                  </Div>
                </Div>
                <ExploreLocalGoodiesPlaceholder width={1268} />
              </Div>
            </section>
            <section
              id="partners"
              className="middle-middle-column"
              style={{
                background: color.background.dark,
                height: 800 * scale,
                width,
              }}
            >
              <Div
                className="middle-middle-column"
                style={{
                  transform: `scale(${scale})`,
                }}
              >
                <Stack
                  direction="column"
                  columnAlign="center"
                  rowAlign="center"
                  spacing={14}
                  style={{ marginBottom: 64 }}
                >
                  <h1 style={{ color: color.text.dark }}>Our partners</h1>
                  <h3
                    style={{
                      color: color.text.dark,
                      textAlign: "center",
                      width: 576,
                    }}
                  >
                    We help locally owned small businesses increase their
                    revenue and website traffic. We’re here to help you stay
                    competitive against big-box retailers while incurring little
                    costs and minimal risks.
                  </h3>
                </Stack>
                <OurPartnersPlaceholder
                  width={1268}
                  style={{ marginBottom: 64 }}
                />
                <Link href="/signup/business">
                  <button
                    style={{
                      background: color.text.dark,
                      borderRadius: 11,
                      color: color.text.light,
                      cursor: "pointer",
                      padding: "20px 24px",
                    }}
                  >
                    Become a Partner
                  </button>
                </Link>
              </Div>
            </section>
            <section
              id="meet-the-team"
              className="middle-middle-column"
              style={{
                background: color.background.light,
                height: 800 * scale,
                width,
              }}
            >
              <Div
                className="middle-middle-column"
                style={{
                  transform: `scale(${scale})`,
                }}
              >
                <h1
                  className={styles.h1}
                  style={{ color: color.text.dark, marginBottom: 65 }}
                >
                  Meet the team
                </h1>
                <Stack
                  direction="row"
                  columnAlign="center"
                  rowAlign="center"
                  spacing={120}
                >
                  <img
                    alt="Locality Team Photo"
                    loading="lazy"
                    height={388}
                    width={581}
                    src="/images/team.jpg"
                  />
                  <Values />
                </Stack>
              </Div>
            </section>
          </Div>
        </Div>
      )}
    </ThemeContext.Consumer>
  );
};

export default Home;

/*
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

import AddToChrome from "components/common/images/AddToChrome";
import StepArrow from "components/common/images/StepArrow";
import MiniSearch from "components/search/MiniSearch";
import ThemeContext from "components/common/Theme";
import Stack from "components/common/Stack";
import LocalityExtension from "components/common/images/LocalityExtension";
import ExploreLocalGoodiesPlaceholder from "components/common/images/ExploreLocalGoodiesPlaceholder";
import OurPartnersPlaceholder from "components/common/images/OurPartnersPlaceholder";
import Values from "components/common/images/Values";
import styles from "./Home.module.css";

import type { FC } from "react";

const NewUser = dynamic(async () => import("components/common/popups/NewUser"));

interface HomeProps {
  isNewUser: boolean;
  width: number;
}

const Home: FC<HomeProps> = ({ isNewUser, width }) => {
  const scale = width / 1519;
  const [playSteps, setPlaySteps] = useState(true);
  const [howItWorksStep, setHowItWorksStep] = useState(1);

  useEffect(() => {
    if (playSteps) {
      const intervalTimer = setInterval(() => {
        setHowItWorksStep((howItWorksStep % 3) + 1);
      }, 5000);

      return (): void => {
        clearInterval(intervalTimer);
      };
    }
  }, [howItWorksStep, playSteps]);

  return (
    <ThemeContext.Consumer>
      {({ color }): JSX.Element => (
        <Stack
          direction="column"
          rowAlign="center"
          style={{
            position: "relative",
            zIndex: 0,
            width,
          }}
        >
          {isNewUser && <NewUser />}
          
          <Stack
            direction="column"
            columnAlign="center"
            rowAlign="center"
            style={{
              background: color.background.light,
            }}
          >
            <section
              className={styles.section}
              style={{
                height: 729 * scale,
              }}
            >
              <Stack
                direction="row"
                rowAlign="center"
                priority={[0, 1]}
                style={{ transform: `scale(${scale})` }}
              >
                <Stack direction="column" spacing={24}>
                  <h1 style={{ color: color.text.dark, width: 582 }}>
                    Your Online Marketplace for High Quality Local Products
                  </h1>
                  <h2 style={{ color: color.text.dark, width: 504 }}>
                    Explore local offerings and support local businesses
                  </h2>
                  <button
                    className={styles.button}
                    onClick={(): void => {
                      window.open(
                        "https://chrome.google.com/webstore/detail/locality-local-shopping-m/cklipomamlgjpmihfhfdjmlhnbadnedl",
                        "_blank"
                      );
                    }}
                    style={{
                      background: color.text.dark,
                      color: color.text.light,
                    }}
                  >
                    <AddToChrome />
                  </button>
                </Stack>
                <LocalityExtension width={594} />
              </Stack>
            </section>
          </Stack>
          <Stack
            direction="column"
            rowAlign="center"
            style={{ background: color.background.dark }}
          >
            <section
              className={styles.section}
              style={{
                height: 655 * scale,
              }}
            >
              <Stack
                direction="row"
                columnAlign="flex-start"
                rowAlign="center"
                spacing={84}
                style={{ transform: `scale(${scale})` }}
              >
                <Stack direction="column" spacing={24} style={{ width: 412 }}>
                  <h1 style={{ color: color.text.dark }}>How it works</h1>
                  <h3 style={{ color: color.text.dark }}>
                    We make it effortless to shop local
                    <br />- It's as easy as 1, 2, 3
                  </h3>
                  <Stack
                    direction="row"
                    rowAlign="center"
                    style={{ cursor: "pointer" }}
                    onClick={(): void => {
                      setPlaySteps(false);
                      setHowItWorksStep(1);
                    }}
                  >
                    <StepArrow
                      {...(howItWorksStep !== 1 && { visibility: "hidden" })}
                    />
                    <div
                      className={styles["step-number"]}
                      style={{
                        color: color.text.dark,
                        ...(howItWorksStep === 1 && { fontWeight: 700 }),
                      }}
                    >
                      1
                    </div>
                    <h3
                      className={
                        howItWorksStep === 1 ? styles["step-wrapper"] : ""
                      }
                      style={{
                        color: color.text.dark,
                        marginLeft: 36,
                        marginTop: -5,
                        ...(howItWorksStep === 1
                          ? {
                              fontWeight: 700,
                            }
                          : { paddingLeft: 16 }),
                      }}
                    >
                      Add to Chrome
                    </h3>
                  </Stack>
                  <Stack
                    direction="row"
                    rowAlign="center"
                    style={{ cursor: "pointer" }}
                    onClick={(): void => {
                      setPlaySteps(false);
                      setHowItWorksStep(2);
                    }}
                  >
                    <StepArrow
                      {...(howItWorksStep !== 2 && { visibility: "hidden" })}
                    />
                    <div
                      className={styles["step-number"]}
                      style={{
                        color: color.text.dark,
                        ...(howItWorksStep === 2 && { fontWeight: 700 }),
                      }}
                    >
                      2
                    </div>
                    <h3
                      className={
                        howItWorksStep === 2 ? styles["step-wrapper"] : ""
                      }
                      style={{
                        color: color.text.dark,
                        marginLeft: 36,
                        marginTop: -5,
                        ...(howItWorksStep === 2
                          ? {
                              fontWeight: 700,
                            }
                          : { paddingLeft: 16 }),
                      }}
                    >
                      Shop as usual on big box retailers
                    </h3>
                  </Stack>
                  <Stack
                    direction="row"
                    rowAlign="center"
                    style={{ cursor: "pointer" }}
                    onClick={(): void => {
                      setPlaySteps(false);
                      setHowItWorksStep(3);
                    }}
                  >
                    <StepArrow
                      {...(howItWorksStep !== 3 && { visibility: "hidden" })}
                    />
                    <div
                      className={styles["step-number"]}
                      style={{
                        color: color.text.dark,
                        ...(howItWorksStep === 3 && { fontWeight: 700 }),
                      }}
                    >
                      3
                    </div>
                    <h3
                      className={
                        howItWorksStep === 3 ? styles["step-wrapper"] : ""
                      }
                      style={{
                        color: color.text.dark,
                        marginLeft: 36,
                        marginTop: -5,
                        ...(howItWorksStep === 3
                          ? {
                              fontWeight: 700,
                            }
                          : { paddingLeft: 16 }),
                      }}
                    >
                      We'll find the local products for you
                    </h3>
                  </Stack>
                </Stack>
                <Stack direction="column" rowAlign="center" spacing={24}>
                  <div
                    className={styles["step-image"]}
                    style={{ width: 680 }}
                  />
                  <h3 className={styles.h3} style={{ color: color.text.dark }}>
                    {((): string => {
                      switch (howItWorksStep) {
                        case 1:
                          return "Adding Locality to your chrome browser takes 1 second and is 100% free";
                        case 2:
                          return "Locality will activate on platforms like Amazon, Etsy, and Walmart";
                        case 3:
                          return "We’ll search for the same product in your area, saving you time and hopefully money too!";
                      }
                      return "";
                    })()}
                  </h3>
                </Stack>
              </Stack>
            </section>
          </Stack>
          <Stack
            direction="column"
            rowAlign="center"
            style={{ background: color.background.light, width }}
          >
            <section
              className={styles.section}
              style={{
                height: 985 * scale,
                transform: `scaleX(${scale})`,
              }}
            >
              <Stack
                direction="column"
                columnAlign="center"
                rowAlign="flex-start"
                spacing={58}
                style={{ transform: `scaleY(${scale})` }}
              >
                <Stack direction="column" rowAlign="flex-start" spacing={24}>
                  <h1 className={styles.h1} style={{ color: color.text.dark }}>
                    Explore local goodies
                  </h1>
                  <Stack
                    direction="row"
                    priority={[0, 1, 0]}
                    style={{ width: 1176 }}
                  >
                    <h3
                      className={styles.h3}
                      style={{
                        color: color.text.dark,
                        paddingLeft: 3,
                        width: 448,
                      }}
                    >
                      We care about creating meaningful impact in our
                      communities. Each of your purchases promotes positive
                      social, economical, and environmental change.
                    </h3>
                    <div />
                    <Stack direction="row" rowAlign="center" spacing={32}>
                      <Stack direction="row" spacing={6}>
                        <h3
                          className={styles.h3}
                          style={{ color: color.text.dark, fontWeight: 700 }}
                        >
                          Browse more
                        </h3>
                        <svg
                          width={12}
                          height={11}
                          viewBox="0 0 12 11"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.7629 5.27283L11.4324 4.95608L11.1953 4.72891L6.26043 0L5.45576 0.771088L9.8197 4.95608H0V6.04392H9.8197L5.45576 10.2289L6.26043 11L12 5.5L11.7629 5.27283Z"
                            fill="#112378"
                          />
                        </svg>
                      </Stack>
                      <MiniSearch width={247} />
                    </Stack>
                  </Stack>
                </Stack>
                <ExploreLocalGoodiesPlaceholder height={430} width={1176} />
              </Stack>
            </section>
          </Stack>
          <Stack direction="column" rowAlign="center" style={{ width }}>
            <section
              id="partners"
              className={styles.section}
              style={{
                height: 816 * scale,
                transform: `scaleX(${scale})`,
              }}
            >
              <Stack
                direction="column"
                columnAlign="center"
                rowAlign="center"
                spacing={64}
                style={{ transform: `scaleY(${scale})` }}
              >
                <Stack
                  direction="column"
                  columnAlign="center"
                  rowAlign="center"
                  spacing={14}
                >
                  <h1 className={styles.h1} style={{ color: color.text.dark }}>
                    Our partners
                  </h1>
                  <h3
                    className={styles.h3}
                    style={{
                      color: color.text.dark,
                      textAlign: "center",
                      width: 576,
                    }}
                  >
                    We help locally owned small businesses increase their
                    revenue and website traffic. We’re here to help you stay
                    competitive against big-box retailers while incurring little
                    costs and minimal risks.
                  </h3>
                </Stack>
                <OurPartnersPlaceholder width={1176} />
                <Link href="/signup/business">
                  <button
                    style={{
                      background: color.text.dark,
                      borderRadius: 11,
                      color: color.text.light,
                      cursor: "pointer",
                      padding: "20px 24px",
                    }}
                  >
                    Become a Partner
                  </button>
                </Link>
              </Stack>
            </section>
          </Stack>
          <Stack
            direction="column"
            columnAlign="center"
            rowAlign="center"
            style={{ background: color.background.light, width }}
          >
            <section
              id="meet-the-team"
              className={styles.section}
              style={{
                height: 830 * scale,
                transform: `scaleX(${scale})`,
              }}
            >
              <Stack
                direction="column"
                columnAlign="center"
                rowAlign="center"
                spacing={65}
                style={{ transform: `scaleY(${scale})` }}
              >
                <h1 className={styles.h1} style={{ color: color.text.dark }}>
                  Meet the team
                </h1>
                <Stack
                  direction="row"
                  columnAlign="center"
                  rowAlign="center"
                  spacing={120}
                >
                  <img
                    alt="Locality Team Photo"
                    height={388}
                    width={581}
                    src="/images/team.jpg"
                  />
                  <Values />
                </Stack>
              </Stack>
            </section>
          </Stack>
        </Stack>
      )}
    </ThemeContext.Consumer>
  );
};

export default Home;

*/
