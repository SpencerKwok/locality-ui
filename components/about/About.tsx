import AboutDesktop from "components/about/AboutDesktop";
import AboutMobile from "components/about/AboutMobile";

import type { FC } from "react";

export interface AboutProps {
  isMobile: boolean;
  width: number;
}

const About: FC<AboutProps> = ({ isMobile, width }) => {
  return isMobile ? <AboutMobile /> : <AboutDesktop width={width * 0.8} />;
};

export default About;
