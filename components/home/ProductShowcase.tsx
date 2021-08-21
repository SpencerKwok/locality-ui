import { useState } from "react";

import LeftArrow from "components/common/images/home/LeftArrow";
import RightArrow from "components/common/images/home/RightArrow";
import Stack from "components/common/Stack";
import styles from "components/home/Home.module.css";

import type { FC } from "react";

interface ProductShowcaseProps {
  loading?: "eager" | "lazy";
  width: number;
}

interface ProductLogoProps {
  loading?: "eager" | "lazy";
  alt: string;
  details: string;
  id: string;
  href: string;
  src: string;
}

const ProductLogo: FC<ProductLogoProps> = ({
  loading,
  alt,
  details,
  id,
  href,
  src,
}) => {
  const [useFallback, setUseFallback] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: "none",
        color: "#000000",
      }}
    >
      <div className={styles["product-container-container"]}>
        <div id={id} className={styles["product-container"]}>
          <img
            alt={alt}
            loading={loading}
            height={380}
            width={281}
            src={useFallback ? src.replace(".webp", ".jpg") : src}
            onError={(): void => {
              if (!useFallback) {
                setUseFallback(true);
              }
            }}
          />
        </div>
      </div>
      <h3>{details}</h3>
    </a>
  );
};

const ProductShowcase: FC<ProductShowcaseProps> = ({ loading, width }) => {
  const [arrowOpacity, setArrowOpacity] = useState([0.3, 1]);
  return (
    <Stack
      direction="column"
      columnAlign="center"
      rowAlign="center"
      spacing={40}
      style={{ scrollBehavior: "smooth" }}
    >
      <Stack
        id="explore-local-goodies-showcase"
        direction="row"
        columnAlign="flex-start"
        rowAlign="center"
        spacing={45}
        style={{ width, overflow: "hidden" }}
      >
        <ProductLogo
          loading={loading}
          alt="Local Goodie 1"
          details="10 Snack Box"
          id="local-goodie-1"
          href="https://laidbacksnacks.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1629517880/home/local-goodie-1.webp"
        />
        <ProductLogo
          loading={loading}
          alt="Local Goodie 2"
          details="Herbal Bath Tea No 2: Ease"
          id="local-goodie-2"
          href="https://www.liveeasyco.ca"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1629517460/home/local-goodie-2.webp"
        />
        <ProductLogo
          loading={loading}
          alt="Local Goodie 3"
          details="Bath and Body Aromatherapy Oil"
          id="local-goodie-3"
          href="https://shopcadine.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1629517499/home/local-goodie-3.webp"
        />
        <ProductLogo
          loading={loading}
          alt="Local Goodie 4"
          details="Chonky (Sharky) Printed T-Shirt"
          id="local-goodie-4"
          href="https://www.unimpressedofficial.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1629517044/home/local-goodie-4.webp"
        />
        <ProductLogo
          loading={loading}
          alt="Local Goodie 5"
          details="12-pack Custom Assorted Case"
          id="local-goodie-5"
          href="https://www.talitykombucha.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1629519473/home/local-goodie-5.webp"
        />
      </Stack>
      <Stack
        direction="row"
        columnAlign="center"
        rowAlign="center"
        spacing={40}
      >
        <LeftArrow
          opacity={arrowOpacity[0]}
          style={{ cursor: "pointer" }}
          onClick={(): void => {
            const elem = document.getElementById("local-goodie-1");
            if (elem) {
              elem.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
              });
              setArrowOpacity([0.3, 1]);
            }
          }}
        />
        <RightArrow
          opacity={arrowOpacity[1]}
          style={{ cursor: "pointer" }}
          onClick={(): void => {
            const elem = document.getElementById("local-goodie-5");
            if (elem) {
              elem.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
              });
              setArrowOpacity([1, 0.3]);
            }
          }}
        />
      </Stack>
    </Stack>
  );
};

export default ProductShowcase;
