import Image from "next/image";

import Stack from "components/common/Stack";

import type { CSSProperties, FC } from "react";

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
          <Image
            alt="Ruoravaan Logo"
            layout="fixed"
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1628292816/home/partner-1-1.webp"
            height={176}
            width={176}
          />
        </a>
        <a href="https://nusnus.ca/" target="_blank" rel="noopener noreferrer">
          <Image
            alt="Nusnus Logo"
            layout="fixed"
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1628292891/home/partner-1-2.webp"
            height={176}
            width={176}
          />
        </a>
        <a
          href="https://www.liveeasyco.ca/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            alt="Liv'ez Logo"
            layout="fixed"
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1628292891/home/partner-1-3.webp"
            height={176}
            width={176}
          />
        </a>
        <a
          href="https://www.loopedbyalli.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            alt="Looped by Alli Logo"
            layout="fixed"
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1628292891/home/partner-1-4.webp"
            height={176}
            width={176}
          />
        </a>
        <a
          href="https://www.raincity.games/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            alt="Rain City Games Logo"
            layout="fixed"
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1628292891/home/partner-1-5.webp"
            height={176}
            width={176}
          />
        </a>
        <a
          href="https://primpnproper.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            alt="Primp & Proper Logo"
            layout="fixed"
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1628292891/home/partner-1-6.webp"
            height={176}
            width={176}
          />
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
          <Image
            alt="Drooler Treats Logo"
            layout="fixed"
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1628292891/home/partner-2-1.webp"
            height={176}
            width={176}
          />
        </a>
        <a
          href="https://www.cantiqliving.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            alt="Cantiq Living Logo"
            layout="fixed"
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1628292891/home/partner-2-2.webp"
            height={176}
            width={176}
          />
        </a>
        <a
          href="https://shopcadine.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            alt="Cadine Logo"
            layout="fixed"
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1628292891/home/partner-2-3.webp"
            height={176}
            width={176}
          />
        </a>
        <a
          href="https://www.lemonjarz.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            alt="Lemonjarz Logo"
            layout="fixed"
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1628292891/home/partner-2-4.webp"
            height={176}
            width={176}
          />
        </a>
        <a
          href="https://www.etsy.com/shop/BambooBirdie"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            alt="Bamboo Birdie Logo"
            layout="fixed"
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1628292891/home/partner-2-5.webp"
            height={176}
            width={176}
          />
        </a>
        <a
          href="https://www.thealfajorcompany.ca/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            alt="The Alfajor Company Logo"
            layout="fixed"
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1628292891/home/partner-2-6.webp"
            height={176}
            width={176}
          />
        </a>
        <a
          href="https://www.unimpressedofficial.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            alt="Unimpressed Official Logo"
            layout="fixed"
            src="https://res.cloudinary.com/hcory49pf/image/upload/v1628292891/home/partner-2-7.webp"
            height={176}
            width={176}
          />
        </a>
      </Stack>
    </Stack>
  );
};

export default PartnersShowcase;
