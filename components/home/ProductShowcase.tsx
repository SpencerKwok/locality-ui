import { useState } from "react";

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
      <div className={styles["product-wrapper-wrapper"]}>
        <div id={id} className={styles["product-wrapper"]}>
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
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628291241/home/local-goodie-1.webp"
        />
        <ProductLogo
          loading={loading}
          alt="Local Goodie 2"
          details="Herbal Bath Tea No 2: Ease"
          id="local-goodie-2"
          href="https://www.liveeasyco.ca"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628291607/home/local-goodie-2.webp"
        />
        <ProductLogo
          loading={loading}
          alt="Local Goodie 3"
          details="Bath and Body Aromatherapy Oil"
          id="local-goodie-3"
          href="https://shopcadine.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628291664/home/local-goodie-3.webp"
        />
        <ProductLogo
          loading={loading}
          alt="Local Goodie 4"
          details="Chonky (Sharky) Printed T-Shirt"
          id="local-goodie-4"
          href="https://www.unimpressedofficial.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628291707/home/local-goodie-4.webp"
        />
        <ProductLogo
          loading={loading}
          alt="Local Goodie 5"
          details="12-pack Custom Assorted Case"
          id="local-goodie-5"
          href="https://www.talitykombucha.com"
          src="https://res.cloudinary.com/hcory49pf/image/upload/v1628291750/home/local-goodie-5.webp"
        />
      </Stack>
      <Stack
        direction="row"
        columnAlign="center"
        rowAlign="center"
        spacing={40}
      >
        <svg
          width="34"
          height="24"
          viewBox="0 0 34 24"
          fill="none"
          style={{ cursor: "pointer" }}
          xmlns="http://www.w3.org/2000/svg"
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
        >
          <path
            opacity={arrowOpacity[0]}
            d="M10.8623 0.434673C10.9674 0.305685 11.0977 0.200526 11.2448 0.125898C11.3919 0.0512711 11.5526 0.00881347 11.7167 0.00123231C11.8807 -0.00634885 12.0445 0.0211128 12.1976 0.0818665C12.3507 0.14262 12.4897 0.235333 12.6058 0.354094C12.7219 0.472855 12.8126 0.615059 12.872 0.771639C12.9314 0.92822 12.9582 1.09574 12.9508 1.26352C12.9434 1.43131 12.9019 1.59567 12.8289 1.74613C12.756 1.89659 12.6531 2.02986 12.527 2.13742L4.0333 10.8351H32.1082C32.4113 10.8515 32.6967 10.9862 32.9055 11.2115C33.1144 11.4367 33.2308 11.7353 33.2308 12.0457C33.2308 12.3561 33.1144 12.6547 32.9055 12.88C32.6967 13.1052 32.4113 13.2399 32.1082 13.2564H4.0333L12.5404 21.9438C12.7545 22.1732 12.8739 22.4781 12.8739 22.7952C12.8739 23.1123 12.7545 23.4172 12.5404 23.6466C12.4312 23.7586 12.3014 23.8475 12.1586 23.9081C12.0158 23.9688 11.8626 24 11.708 24C11.5533 24 11.4002 23.9688 11.2573 23.9081C11.1145 23.8475 10.9848 23.7586 10.8756 23.6466L0.354122 12.8852C0.242138 12.7749 0.153057 12.6427 0.0922089 12.4964C0.0313606 12.3501 0 12.1928 0 12.0338C0 11.8748 0.0313606 11.7175 0.0922089 11.5712C0.153057 11.4249 0.242138 11.2927 0.354122 11.1824L10.8623 0.434673Z"
            fill="#112378"
          />
        </svg>
        <svg
          width="34"
          height="24"
          viewBox="0 0 34 24"
          fill="none"
          style={{ cursor: "pointer" }}
          xmlns="http://www.w3.org/2000/svg"
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
        >
          <path
            opacity={arrowOpacity[1]}
            d="M22.5993 0.434673C22.4941 0.305685 22.3638 0.200526 22.2167 0.125898C22.0696 0.0512711 21.9089 0.00881347 21.7449 0.00123231C21.5808 -0.00634885 21.4171 0.0211128 21.264 0.0818665C21.1109 0.14262 20.9718 0.235333 20.8557 0.354094C20.7396 0.472855 20.649 0.615059 20.5896 0.771639C20.5302 0.92822 20.5033 1.09574 20.5107 1.26352C20.5181 1.43131 20.5597 1.59567 20.6326 1.74613C20.7056 1.89659 20.8084 2.02986 20.9345 2.13742L29.4282 10.8351H1.3533C1.05023 10.8515 0.764874 10.9862 0.556032 11.2115C0.347189 11.4367 0.230774 11.7353 0.230774 12.0457C0.230774 12.3561 0.347189 12.6547 0.556032 12.88C0.764874 13.1052 1.05023 13.2399 1.3533 13.2564H29.4282L20.9212 21.9438C20.7071 22.1732 20.5876 22.4781 20.5876 22.7952C20.5876 23.1123 20.7071 23.4172 20.9212 23.6466C21.0304 23.7586 21.1601 23.8475 21.3029 23.9081C21.4458 23.9688 21.5989 24 21.7536 24C21.9082 24 22.0614 23.9688 22.2042 23.9081C22.3471 23.8475 22.4768 23.7586 22.586 23.6466L33.1074 12.8852C33.2194 12.7749 33.3085 12.6427 33.3693 12.4964C33.4302 12.3501 33.4615 12.1928 33.4615 12.0338C33.4615 11.8748 33.4302 11.7175 33.3693 11.5712C33.3085 11.4249 33.2194 11.2927 33.1074 11.1824L22.5993 0.434673Z"
            fill="#112378"
          />
        </svg>
      </Stack>
    </Stack>
  );
};

export default ProductShowcase;
