import React, { useRef, useState } from "react";
import Lottie from "react-lottie-player";
import Link from "next/link";

import Button from "components/common/button/Button";
import LocalityDemoLottie from "public/images/home/locality-extension-lottie.json";
import ExploreLocalGoodiesMobile from "components/home/ProductShowcaseMobile";
import OurPartnersMobile from "components/home/PartnersShowcaseMobile";
import ValuesShowcaseMobile from "components/home/ValuesShowcaseMobile";
import ThemeContext from "components/common/Theme";
import Stack from "components/common/Stack";
import styles from "./Home.module.css";

import type { FC } from "react";

interface HomeProps {}

const Home: FC<HomeProps> = ({}) => {
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
      {({ color }): JSX.Element => (
        <Stack direction="column">
          <section
            className="middle-middle-column"
            style={{
              background: color.background.light,
              paddingTop: 60,
              paddingBottom: 60,
              width: "100%",
            }}
          >
            <Stack direction="column" spacing={24} style={{ width: "90%" }}>
              <h1
                style={{
                  color: color.text.dark,
                }}
              >
                Your Online Marketplace for High Quality Local Products in
                British Columbia
              </h1>
              <h2
                style={{
                  color: color.text.dark,
                }}
              >
                Explore local offerings and support local businesses
              </h2>
              <Lottie
                play={true}
                loop={false}
                animationData={LocalityDemoLottie}
                style={{
                  width: "100%",
                }}
                onLoad={startVideo}
                onComplete={startVideo}
              />
            </Stack>
          </section>
          <section
            className="middle-middle-column"
            id="#how-it-works"
            style={{
              background: color.background.dark,
              paddingTop: 60,
              paddingBottom: 60,
              width: "100%",
            }}
          >
            <Stack direction="column" spacing={24} style={{ width: "90%" }}>
              <h1 style={{ color: color.text.dark, marginBottom: 24 }}>
                How it works
              </h1>
              <Stack direction="column" rowAlign="center">
                <div
                  className={styles["step-image"]}
                  style={{
                    overflow: "hidden",
                    marginBottom: 24,
                  }}
                >
                  <video
                    loop
                    muted
                    preload="none"
                    style={{ width: "100%", marginTop: -3 }}
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
                <h3 className={styles.h3} style={{ color: color.text.dark }}>
                  {((): string => {
                    switch (howItWorksStep) {
                      case 1:
                        return "1. Adding Locality to your chrome browser takes 1 second and is 100% free";
                      case 2:
                        return "2. Locality will activate on platforms like Amazon, Etsy, and Walmart";
                      case 3:
                        return "3. We’ll search for the same product in your area, saving you time and hopefully money too!";
                    }
                    return "";
                  })()}
                </h3>
              </Stack>
            </Stack>
          </section>
          <section
            className="middle-middle-column"
            id="#explore-goodies"
            style={{
              background: color.background.light,
              paddingTop: 60,
              paddingBottom: 60,
              width: "100%",
            }}
          >
            <Stack
              direction="column"
              columnAlign="center"
              rowAlign="center"
              spacing={24}
              style={{
                width: "90%",
              }}
            >
              <Stack direction="column" spacing={12}>
                <h1 style={{ color: color.text.dark }}>
                  Explore local goodies
                </h1>
                <h3
                  style={{
                    color: color.text.dark,
                  }}
                >
                  We care about creating meaningful impact in our communities.
                  Each of your purchases promotes positive social, economical,
                  and environmental change.
                </h3>
              </Stack>
              <ExploreLocalGoodiesMobile
                loading={loadOffscreenContent ? "eager" : "lazy"}
              />
            </Stack>
          </section>
          <section
            className="middle-middle-column"
            id="#our-partners"
            style={{
              paddingTop: 60,
              paddingBottom: 60,
              width: "100%",
            }}
          >
            <Stack
              direction="column"
              columnAlign="center"
              rowAlign="center"
              spacing={64}
              style={{ width: "90%" }}
            >
              <Stack
                direction="column"
                columnAlign="center"
                rowAlign="center"
                spacing={14}
              >
                <h1 style={{ color: color.text.dark }}>Our partners</h1>
                <h3
                  style={{
                    color: color.text.dark,
                    textAlign: "center",
                  }}
                >
                  We help locally owned small businesses increase their revenue
                  and website traffic. We’re here to help you stay competitive
                  against big-box retailers while incurring little costs and
                  minimal risks.
                </h3>
              </Stack>
              <OurPartnersMobile
                loading={loadOffscreenContent ? "eager" : "lazy"}
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
            </Stack>
          </section>
          <section
            className="middle-middle-column"
            id="#meet-the-team"
            style={{
              background: color.background.light,
              paddingTop: 60,
              paddingBottom: 60,
              width: "100%",
            }}
          >
            <Stack
              direction="column"
              columnAlign="center"
              rowAlign="center"
              spacing={12}
              style={{ width: "90%" }}
            >
              <h1 style={{ color: color.text.dark }}>Meet the team</h1>
              <img
                alt="Locality Team"
                loading={loadOffscreenContent ? "eager" : "lazy"}
                width="100%"
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
              <ValuesShowcaseMobile />
            </Stack>
          </section>
        </Stack>
      )}
    </ThemeContext.Consumer>
  );
};

export default Home;
