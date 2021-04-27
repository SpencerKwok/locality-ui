import React from "react";

import AboutDesktop from "./AboutDesktop";
import AboutMobile from "./AboutMobile";
import { useMediaQuery } from "../../lib/common";

export default function About() {
  const isNarrow = useMediaQuery(50, "width");
  return isNarrow ? <AboutMobile /> : <AboutDesktop />;
}
