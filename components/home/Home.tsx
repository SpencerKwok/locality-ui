import React, { useRef, useState } from "react";
import Lottie from "react-lottie-player";
import dynamic from "next/dynamic";
import styled from "styled-components";
import Link from "next/link";

import Button from "components/common/button/Button";
import Chrome from "components/common/images/Chrome";
import LocalityDemoLottie from "public/images/home/locality-extension-lottie.json";
import ProductShowcase from "components/home/ProductShowcase";
import StepArrow from "components/common/images/StepArrow";
import MiniSearch from "components/search/MiniSearch";
import OurPartners from "components/home/PartnersShowcase";
import ThemeContext from "components/common/Theme";
import Stack from "components/common/Stack";
import styles from "./Home.module.css";

import type { FC } from "react";
import ValuesShowcase from "./ValuesShowcase";

// TODO: Make all divs flex
const Div = styled.div`
  display: flex;
`;

const NewUser = dynamic(async () => import("components/common/popups/NewUser"));

interface HomeProps {
  isNewUser: boolean;
}

const Home: FC<HomeProps> = ({ isNewUser }) => {
  const [howItWorksStep, setHowItWorksStep] = useState(0);
  const [loadOffscreenContent, setLoadOffscreenContent] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const howItWorksVideoRef = useRef<HTMLVideoElement>(null);

  const startVideo = (): void => {
    if (
      howItWorksVideoRef.current &&
      howItWorksVideoRef.current.paused === true
    ) {
      howItWorksVideoRef.current.autoplay = true;
      howItWorksVideoRef.current.playsInline = true;
      howItWorksVideoRef.current.controls = false;
      void howItWorksVideoRef.current.play();
    }
  };

  return (
    <ThemeContext.Consumer>
      {({ color, size, scale }): JSX.Element => (
        <Div className="top-middle-column">
          {isNewUser && <NewUser />}
          <Div className="top-middle-column">
            <section
              className="middle-middle-column"
              style={{
                overflow: "hidden",
                background: color.background.light,
                height: 670 * scale,
                paddingTop: 65 * scale,
                paddingBottom: 65 * scale,
                width: size.width,
              }}
            >
              <div style={{ height: 670 }}>
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
                      Your Online Marketplace for High Quality Local Products in
                      British Columbia
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
                    <a
                      href="https://chrome.google.com/webstore/detail/locality-local-shopping-m/cklipomamlgjpmihfhfdjmlhnbadnedl"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className={styles.button} variant="dark">
                        <Stack direction="row" rowAlign="center" spacing={16}>
                          <Chrome width={21} />
                          <Stack direction="row" rowAlign="center" spacing={8}>
                            <span
                              style={{
                                fontSize: 16,
                                fontStyle: "normal",
                                fontWeight: 600,
                              }}
                            >
                              Add to Chrome
                            </span>
                            <span
                              style={{
                                fontSize: 16,
                                fontStyle: "normal",
                                fontWeight: 600,
                                opacity: 0.8,
                              }}
                            >
                              It's free!
                            </span>
                          </Stack>
                        </Stack>
                      </Button>
                    </a>
                  </Div>
                  <Lottie
                    play={true}
                    loop={false}
                    animationData={LocalityDemoLottie}
                    style={{
                      height: 540,
                      width: 678,
                    }}
                    onLoad={startVideo}
                    onComplete={startVideo}
                  />
                </Div>
              </div>
            </section>
            <section
              className="middle-middle-column"
              style={{
                overflow: "hidden",
                background: color.background.dark,
                height: 670 * scale,
                paddingTop: 65 * scale,
                paddingBottom: 65 * scale,
                width: size.width,
              }}
            >
              <Div className="middle-middle-column" style={{ height: 670 }}>
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
                        if (howItWorksVideoRef.current) {
                          howItWorksVideoRef.current.currentTime = 0;
                        }
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
                          howItWorksStep === 1 ? styles["step-container"] : ""
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
                        if (howItWorksVideoRef.current) {
                          howItWorksVideoRef.current.currentTime = 3.6;
                        }
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
                          howItWorksStep === 2 ? styles["step-container"] : ""
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
                        if (howItWorksVideoRef.current) {
                          howItWorksVideoRef.current.currentTime = 14.2;
                        }
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
                          howItWorksStep === 3 ? styles["step-container"] : ""
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
                    <div
                      className={styles["step-image"]}
                      style={{
                        overflow: "hidden",
                        height: 337,
                        width: 680,
                        marginBottom: 24,
                      }}
                    >
                      <video
                        loop
                        muted
                        preload="none"
                        style={{ height: 340, width: 680, marginTop: -3 }}
                        src="https://res.cloudinary.com/hcory49pf/video/upload/v1630555305/home/all-steps.mp4"
                        ref={howItWorksVideoRef}
                        onTimeUpdate={(e): void => {
                          const t = e.currentTarget.currentTime;
                          if (t <= 3.5) {
                            if (howItWorksStep !== 1) {
                              setHowItWorksStep(1);
                            }
                          } else if (t <= 14) {
                            if (howItWorksStep !== 2) {
                              setHowItWorksStep(2);
                            }
                          } else if (howItWorksStep !== 3) {
                            setHowItWorksStep(3);
                          }
                        }}
                        onLoadedData={(): void => {
                          setLoadOffscreenContent(true);
                        }}
                      />
                    </div>
                    <h3
                      className={styles.h3}
                      style={{ color: color.text.dark }}
                    >
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
              </Div>
            </section>
            <section
              className="middle-middle-column"
              style={{
                overflow: "hidden",
                background: color.background.light,
                height: 670 * scale,
                paddingTop: 65 * scale,
                paddingBottom: 65 * scale,
                width: size.width,
              }}
            >
              <div style={{ height: 670 }}>
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
                        <MiniSearch width={236} />
                      </Div>
                    </Div>
                  </Div>
                  <ProductShowcase
                    loading={loadOffscreenContent ? "eager" : "lazy"}
                    width={1268}
                  />
                </Div>
              </div>
            </section>
            <section
              className="middle-middle-column"
              style={{
                overflow: "hidden",
                height: 670 * scale,
                paddingTop: 65 * scale,
                paddingBottom: 65 * scale,
                width: size.width,
              }}
            >
              <div style={{ height: 670 }}>
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
                      competitive against big-box retailers while incurring
                      little costs and minimal risks.
                    </h3>
                  </Stack>
                  <OurPartners
                    loading={loadOffscreenContent ? "eager" : "lazy"}
                    style={{ marginBottom: 64 }}
                  />
                  <Link href="/signup/business">
                    <a>
                      <Button
                        variant="dark"
                        style={{
                          padding: "20px 24px",
                        }}
                      >
                        Become a Partner
                      </Button>
                    </a>
                  </Link>
                </Div>
              </div>
            </section>
            <section
              className="middle-middle-column"
              style={{
                overflow: "hidden",
                background: color.background.light,
                height: 670 * scale,
                paddingTop: 65 * scale,
                paddingBottom: 65 * scale,
                width: size.width,
              }}
            >
              <Div className="middle-middle-column" style={{ height: 670 }}>
                <Div
                  className="middle-middle-column"
                  style={{
                    transform: `scale(${scale})`,
                  }}
                >
                  <h1 style={{ color: color.text.dark, marginBottom: 65 }}>
                    Meet the team
                  </h1>
                  <Stack
                    direction="row"
                    columnAlign="center"
                    rowAlign="center"
                    spacing={120}
                  >
                    <div
                      style={{
                        height: 388,
                        width: 581,
                        borderRadius: 12,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        alt="Locality Team"
                        loading={loadOffscreenContent ? "eager" : "lazy"}
                        height={388}
                        width={581}
                        src={
                          useFallback
                            ? "https://res.cloudinary.com/hcory49pf/image/upload/v1629521499/home/locality-team.jpg"
                            : "https://res.cloudinary.com/hcory49pf/image/upload/v1629521499/home/locality-team.webp"
                        }
                        onError={(): void => {
                          if (!useFallback) {
                            setUseFallback(true);
                          }
                        }}
                      />
                    </div>
                    <ValuesShowcase height={388} />
                  </Stack>
                </Div>
              </Div>
            </section>
          </Div>
        </Div>
      )}
    </ThemeContext.Consumer>
  );
};

export default Home;
