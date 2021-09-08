import OurVision from "components/common/images/home/OurVision";
import OurPurpose from "components/common/images/home/OurPurpose";
import OurMission from "components/common/images/home/OurMission";
import ThemeContext from "components/common/Theme";
import Stack from "components/common/Stack";

import type { FC } from "react";

interface ValuesShowcaseProps {}

const ValuesShowcase: FC<ValuesShowcaseProps> = ({}) => {
  return (
    <ThemeContext.Consumer>
      {({ color }): JSX.Element => (
        <Stack
          direction="column"
          columnAlign="center"
          rowAlign="flex-start"
          spacing={32}
        >
          <Stack
            direction="column"
            columnAlign="flex-start"
            rowAlign="flex-start"
            spacing={6}
          >
            <Stack
              direction="row"
              columnAlign="center"
              rowAlign="center"
              spacing={17.33}
            >
              <OurVision />
              <h3 style={{ color: "#F582AE", paddingBottom: 4 }}>
                <b>Our Vision</b>
              </h3>
            </Stack>
            <p style={{ color: color.text.dark }}>
              To cultivate a world where local shopping is first, not an
              afterthought
            </p>
          </Stack>
          <Stack
            direction="column"
            columnAlign="flex-start"
            rowAlign="flex-start"
            spacing={6}
          >
            <Stack
              direction="row"
              columnAlign="center"
              rowAlign="center"
              spacing={17.33}
            >
              <OurPurpose />
              <h3 style={{ color: "#F582AE", paddingBottom: 4 }}>
                <b>Our Purpose</b>
              </h3>
            </Stack>
            <p style={{ color: color.text.dark }}>
              To keep locally owned small businesses at the heart of commerce
            </p>
          </Stack>
          <Stack
            direction="column"
            columnAlign="flex-start"
            rowAlign="flex-start"
            spacing={6}
          >
            <Stack
              direction="row"
              columnAlign="center"
              rowAlign="center"
              spacing={17.33}
            >
              <OurMission />
              <h3 style={{ color: "#F582AE", paddingBottom: 4 }}>
                <b>Our Mission</b>
              </h3>
            </Stack>
            <p style={{ color: color.text.dark }}>
              To create the best local online shopping experience for customers
              and business owners
            </p>
          </Stack>
        </Stack>
      )}
    </ThemeContext.Consumer>
  );
};

export default ValuesShowcase;
