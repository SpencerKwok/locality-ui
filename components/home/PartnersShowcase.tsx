import Image from "next/image";

import Stack from "components/common/Stack";
import styles from "components/home/Home.module.css";

import type { CSSProperties, FC } from "react";

interface PartnerLogoProps {
  alt: string;
  href: string;
  src: string;
}

const PartnerLogo: FC<PartnerLogoProps> = ({ alt, href, src }) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <Stack
        className={styles["partner-logo-wrapper"]}
        direction="row"
        rowAlign="center"
        columnAlign="center"
      >
        <Image alt={alt} layout="fixed" src={src} height={176} width={176} />
      </Stack>
    </a>
  );
};

export interface PartnersShowcaseProps {
  style?: CSSProperties;
}

const PartnersShowcase: FC<PartnersShowcaseProps> = ({ style }) => {
  return (
    <Stack
      direction="column"
      columnAlign="center"
      rowAlign="center"
      spacing={8}
      style={style}
    >
      <Stack
        direction="row"
        columnAlign="center"
        rowAlign="center"
        spacing={88}
      >
        <PartnerLogo
          alt="Ruoravaan Logo"
          href="https://www.ruoravaan.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628951926/home/partner-1-1.webp"
        />
        <PartnerLogo
          alt="Nusnus Logo"
          href="https://nusnus.ca"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628953513/home/partner-1-2.webp"
        />
        <PartnerLogo
          alt="Liv'ez Logo"
          href="https://www.liveeasyco.ca"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628953629/home/partner-1-3.webp"
        />
        <PartnerLogo
          alt="Looped by Alli Logo"
          href="https://www.loopedbyalli.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628953723/home/partner-1-4.webp"
        />
        <PartnerLogo
          alt="Rain City Games Logo"
          href="https://www.raincity.games"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628953841/home/partner-1-5.webp"
        />
        <PartnerLogo
          alt="Primp & Proper Logo"
          href="https://primpnproper.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628954000/home/partner-1-6.webp"
        />
      </Stack>
      <Stack
        direction="row"
        columnAlign="center"
        rowAlign="center"
        spacing={88}
      >
        <PartnerLogo
          alt="Drooler Treats Logo"
          href="https://www.droolertreats.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628955557/home/partner-2-1.webp"
        />
        <PartnerLogo
          alt="Cantiq Living Logo"
          href="https://www.cantiqliving.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628955602/home/partner-2-2.webp"
        />
        <PartnerLogo
          alt="Cadine Logo"
          href="https://shopcadine.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628955614/home/partner-2-3.webp"
        />
        <PartnerLogo
          alt="Lemonjarz Logo"
          href="https://www.lemonjarz.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628955627/home/partner-2-4.webp"
        />
        <PartnerLogo
          alt="Bamboo Birdie Logo"
          href="https://www.etsy.com/shop/BambooBirdie"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628955652/home/partner-2-5.webp"
        />
        <PartnerLogo
          alt="The Alfajor Company Logo"
          href="https://www.thealfajorcompany.ca"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628955665/home/partner-2-6.webp"
        />
        <PartnerLogo
          alt="Unimpressed Official Logo"
          href="https://www.unimpressedofficial.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628955681/home/partner-2-7.webp"
        />
      </Stack>
    </Stack>
  );
};

export default PartnersShowcase;
