import React, { useEffect, useRef, useState } from "react";
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

interface HomeProps {
  width: number;
}

const Home: FC<HomeProps> = ({ width }) => {
  const [hash, setHash] = useState("");
  const [howItWorksStep, setHowItWorksStep] = useState(0);
  const [loadOffscreenContent, setLoadOffscreenContent] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const howItWorksVideoRef = useRef<HTMLVideoElement>(null);
  const scale = Math.round((width / 1519) * 10) / 10;

  useEffect(() => {
    const hashchangeEventListener = (): void => {
      switch (hash) {
        case "#how-it-works":
          if (howItWorksRef.current) {
            window.scrollTo({
              behavior: "smooth",
              top: howItWorksRef.current.getBoundingClientRect().y - 60,
            });
          }
          break;
        case "#explore-goodies":
          window.scrollTo({ behavior: "smooth", top: 1600 * scale });
          break;
        case "#our-partners":
          window.scrollTo({ behavior: "smooth", top: 2400 * scale });
          break;
        case "#meet-the-team":
          window.scrollTo({ behavior: "smooth", top: 3200 * scale });
          break;
        default:
          break;
      }
    };

    // Initialize hash
    hashchangeEventListener();

    window.addEventListener("hashchange", hashchangeEventListener);
    return (): void => {
      window.removeEventListener("hashchange", hashchangeEventListener);
    };
  }, [hash]);

  if (location.hash !== hash) {
    setHash(location.hash);
  }

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
                onEnterFrame={(): void => {
                  if (
                    howItWorksVideoRef.current &&
                    howItWorksVideoRef.current.paused === true
                  ) {
                    howItWorksVideoRef.current.autoplay = true;
                    howItWorksVideoRef.current.playsInline = true;
                    howItWorksVideoRef.current.controls = false;
                    void howItWorksVideoRef.current.play();
                  }
                }}
              />
            </Stack>
          </section>
          <section
            className="middle-middle-column"
            ref={howItWorksRef}
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
                <video
                  loop
                  muted
                  preload="none"
                  className={styles["step-image"]}
                  style={{ width: "100%", marginBottom: 24 }}
                  src="https://res.cloudinary.com/hcory49pf/video/upload/v1628135231/how-to-steps/all-steps.mp4"
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
                width={width}
              />
            </Stack>
          </section>
          <section
            className="middle-middle-column"
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
            >
              <Stack
                direction="column"
                columnAlign="center"
                rowAlign="center"
                spacing={14}
                style={{ width: "90%" }}
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
                width={width}
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
