import dynamic from "next/dynamic";

import Stack from "components/common/Stack";

import type { CSSProperties, FC } from "react";

const Partner_1_1 = dynamic(
  async () => import("components/common/images/home/Partner11")
);
const Partner_1_2 = dynamic(
  async () => import("components/common/images/home/Partner12")
);
const Partner_1_3 = dynamic(
  async () => import("components/common/images/home/Partner13")
);
const Partner_1_4 = dynamic(
  async () => import("components/common/images/home/Partner14")
);
const Partner_1_5 = dynamic(
  async () => import("components/common/images/home/Partner15")
);
const Partner_1_6 = dynamic(
  async () => import("components/common/images/home/Partner16")
);
const Partner_2_1 = dynamic(
  async () => import("components/common/images/home/Partner21")
);
const Partner_2_2 = dynamic(
  async () => import("components/common/images/home/Partner22")
);
const Partner_2_3 = dynamic(
  async () => import("components/common/images/home/Partner23")
);
const Partner_2_4 = dynamic(
  async () => import("components/common/images/home/Partner24")
);
const Partner_2_5 = dynamic(
  async () => import("components/common/images/home/Partner25")
);
const Partner_2_6 = dynamic(
  async () => import("components/common/images/home/Partner26")
);
const Partner_2_7 = dynamic(
  async () => import("components/common/images/home/Partner27")
);

interface PartnersShowcaseProps {
  style?: CSSProperties;
}

const PartnersShowcase: FC<PartnersShowcaseProps> = ({ style }) => {
  return (
    <Stack
      direction="column"
      columnAlign="center"
      rowAlign="center"
      spacing={-40}
      style={style}
    >
      <Stack
        direction="row"
        columnAlign="center"
        rowAlign="center"
        spacing={40}
      >
        <a
          href="https://www.ruoravaan.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Partner_1_1 />
        </a>
        <a href="https://nusnus.ca/" target="_blank" rel="noopener noreferrer">
          <Partner_1_2 />
        </a>
        <a
          href="https://www.liveeasyco.ca/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Partner_1_3 />
        </a>
        <a
          href="https://www.loopedbyalli.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Partner_1_4 />
        </a>
        <a
          href="https://www.raincity.games/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Partner_1_5 />
        </a>
        <a
          href="https://primpnproper.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Partner_1_6 />
        </a>
      </Stack>
      <Stack
        direction="row"
        columnAlign="center"
        rowAlign="center"
        spacing={40}
      >
        <a
          href="https://www.droolertreats.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Partner_2_1 />
        </a>
        <a
          href="https://www.cantiqliving.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Partner_2_2 />
        </a>
        <a
          href="https://shopcadine.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Partner_2_3 />
        </a>
        <a
          href="https://www.lemonjarz.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Partner_2_4 />
        </a>
        <a
          href="https://www.etsy.com/shop/BambooBirdie"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Partner_2_5 />
        </a>
        <a
          href="https://www.thealfajorcompany.ca/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Partner_2_6 />
        </a>
        <a
          href="https://www.unimpressedofficial.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Partner_2_7 />
        </a>
      </Stack>
    </Stack>
  );
};

export default PartnersShowcase;
