import { forwardRef, useRef, useState } from "react";

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
  href: string;
  src: string;
}

const ProductLogo = forwardRef<HTMLDivElement, ProductLogoProps>(
  ({ loading, alt, details, href, src }, ref) => {
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
        <div className={styles["product-container-container"]} ref={ref}>
          <div className={styles["product-container"]}>
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
  }
);

const ProductShowcase: FC<ProductShowcaseProps> = ({ loading, width }) => {
  const [arrowOpacity, setArrowOpacity] = useState([0.3, 1]);
  const productShowcaseRef = useRef<HTMLDivElement>(null);

  return (
    <Stack
      direction="column"
      columnAlign="center"
      rowAlign="center"
      spacing={40}
    >
      <Stack
        ref={productShowcaseRef}
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
          href="https://laidbacksnacks.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1629517880/home/local-goodie-1.webp"
        />
        <ProductLogo
          loading={loading}
          alt="Local Goodie 2"
          details="Herbal Bath Tea No 2: Ease"
          href="https://www.liveeasyco.ca"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1629517460/home/local-goodie-2.webp"
        />
        <ProductLogo
          loading={loading}
          alt="Local Goodie 3"
          details="Bath and Body Aromatherapy Oil"
          href="https://shopcadine.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1629517499/home/local-goodie-3.webp"
        />
        <ProductLogo
          loading={loading}
          alt="Local Goodie 4"
          details="Chonky (Sharky) Printed T-Shirt"
          href="https://www.unimpressedofficial.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1629517044/home/local-goodie-4.webp"
        />
        <ProductLogo
          loading={loading}
          alt="Local Goodie 5"
          details="12-pack Custom Assorted Case"
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
            productShowcaseRef.current?.scrollTo({
              behavior: "smooth",
              left: 0,
            });
            setArrowOpacity([0.3, 1]);
          }}
        />
        <RightArrow
          opacity={arrowOpacity[1]}
          style={{ cursor: "pointer" }}
          onClick={(): void => {
            productShowcaseRef.current?.scrollTo({
              behavior: "smooth",
              left: 326,
            });
            setArrowOpacity([1, 0.3]);
          }}
        />
      </Stack>
    </Stack>
  );
};

export default ProductShowcase;
