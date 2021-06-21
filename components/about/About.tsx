import React from "react";

import AboutDesktop from "components/about/AboutDesktop";
import AboutMobile from "components/about/AboutMobile";

export interface AboutProps {
  isMobile: boolean;
  width: number;
}

export default function About({ isMobile, width }: AboutProps) {
  return isMobile ? <AboutMobile /> : <AboutDesktop width={width * 0.8} />;
}
