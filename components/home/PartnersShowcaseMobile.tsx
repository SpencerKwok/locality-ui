import { useState } from "react";

import ThemeContext from "components/common/Theme";
import Stack from "components/common/Stack";
import styles from "components/home/Home.module.css";

import type { FC } from "react";

interface PartnerLogoProps {
  loading?: "eager" | "lazy";
  alt: string;
  href: string;
  src: string;
}

const PartnerLogo: FC<PartnerLogoProps> = ({ loading, alt, href, src }) => {
  const [useFallback, setUseFallback] = useState(false);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <div className={styles["partner-logo-container-container"]}>
        <div className={styles["partner-logo-container"]}>
          <img
            alt={alt}
            className={styles["partner-logo"]}
            loading={loading}
            src={useFallback ? src.replace(".webp", ".jpg") : src}
            height={176}
            width={176}
            onError={(): void => {
              if (!useFallback) {
                setUseFallback(true);
              }
            }}
          />
        </div>
      </div>
    </a>
  );
};

export interface PartnersShowcaseProps {
  loading?: "eager" | "lazy";
}

const PartnersShowcase: FC<PartnersShowcaseProps> = ({ loading }) => {
  return (
    <ThemeContext.Consumer>
      {({ size }): JSX.Element => (
        <div style={{ overflow: "hidden", width: size.width }}>
          <Stack
            className={styles["partner-showcase"]}
            direction="column"
            spacing={8}
            style={{ paddingTop: 12, paddingBottom: 12 }}
          >
            <Stack direction="row" spacing={88} style={{ marginLeft: -108 }}>
              <PartnerLogo
                loading={loading}
                alt="Primp & Proper Logo"
                href="https://primpnproper.com"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520308/home/partner-1-6.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Ruoravaan Logo"
                href="https://www.ruoravaan.com"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520136/home/partner-1-1.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Nusnus Logo"
                href="https://nusnus.ca"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520190/home/partner-1-2.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Liv'ez Logo"
                href="https://www.liveeasyco.ca"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520222/home/partner-1-3.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Looped by Alli Logo"
                href="https://www.loopedbyalli.com"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520253/home/partner-1-4.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Rain City Games Logo"
                href="https://www.raincity.games"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520282/home/partner-1-5.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Primp & Proper Logo"
                href="https://primpnproper.com"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520308/home/partner-1-6.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Ruoravaan Logo"
                href="https://www.ruoravaan.com"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520136/home/partner-1-1.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Nusnus Logo"
                href="https://nusnus.ca"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520190/home/partner-1-2.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Liv'ez Logo"
                href="https://www.liveeasyco.ca"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520222/home/partner-1-3.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Looped by Alli Logo"
                href="https://www.loopedbyalli.com"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520253/home/partner-1-4.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Rain City Games Logo"
                href="https://www.raincity.games"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520282/home/partner-1-5.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Primp & Proper Logo"
                href="https://primpnproper.com"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520308/home/partner-1-6.webp"
              />
            </Stack>
            <Stack direction="row" spacing={88}>
              <PartnerLogo
                loading={loading}
                alt="Drooler Treats Logo"
                href="https://www.droolertreats.com"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520343/home/partner-2-1.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Cantiq Living Logo"
                href="https://www.cantiqliving.com"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520360/home/partner-2-2.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Cadine Logo"
                href="https://shopcadine.com"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520379/home/partner-2-3.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Lemonjarz Logo"
                href="https://www.lemonjarz.com"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520397/home/partner-2-4.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Bamboo Birdie Logo"
                href="https://www.etsy.com/shop/BambooBirdie"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520416/home/partner-2-5.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="The Alfajor Company Logo"
                href="https://www.thealfajorcompany.ca"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520436/home/partner-2-6.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Drooler Treats Logo"
                href="https://www.droolertreats.com"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520343/home/partner-2-1.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Cantiq Living Logo"
                href="https://www.cantiqliving.com"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520360/home/partner-2-2.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Cadine Logo"
                href="https://shopcadine.com"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520379/home/partner-2-3.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Lemonjarz Logo"
                href="https://www.lemonjarz.com"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520397/home/partner-2-4.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="Bamboo Birdie Logo"
                href="https://www.etsy.com/shop/BambooBirdie"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520416/home/partner-2-5.webp"
              />
              <PartnerLogo
                loading={loading}
                alt="The Alfajor Company Logo"
                href="https://www.thealfajorcompany.ca"
                src="https://res.cloudinary.com/hcory49pf/image/upload/v1629520436/home/partner-2-6.webp"
              />
            </Stack>
          </Stack>
        </div>
      )}
    </ThemeContext.Consumer>
  );
};

export default PartnersShowcase;
