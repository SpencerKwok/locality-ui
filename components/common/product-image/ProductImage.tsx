import { useState } from "react";
import dynamic from "next/dynamic";
import { decode } from "html-entities";

import Heart from "components/common/images/Heart";
import HeartFilled from "components/common/images/HeartFilled";
import Stack from "components/common/Stack";
import styles from "components/common/product-image/ProductImage.module.css";

import type { FC } from "react";

const WishlistToolTip = dynamic(async () => import("./WishlistToolTip"));

export interface ProductImageProps extends React.HTMLProps<HTMLDivElement> {
  alwaysHover?: boolean;
  business: string;
  initialWishList?: boolean;
  link: string;
  loading?: "eager" | "lazy";
  loggedIn?: boolean;
  name: string;
  objectId: string;
  priceRange: FixedLengthArray<[number, number]>;
  variantImages: Array<string>;
  variantIndex: number;
  onToggleWishList: (id: string, value: boolean) => void;
  onProductClick: (objectId: string) => void;
}

const ProductImage: FC<ProductImageProps> = ({
  alwaysHover,
  business,
  initialWishList,
  link,
  loggedIn,
  loading,
  name,
  objectId,
  onToggleWishList,
  onProductClick,
  priceRange,
  variantImages,
  variantIndex,
  style,
}) => {
  const [hover, setHover] = useState(false);
  const [wishlist, setWishList] = useState(initialWishList);

  return (
    <div
      id={objectId}
      key={objectId}
      onClick={(): void => {
        onProductClick(objectId);
      }}
    >
      {loggedIn !== true && (hover === true || alwaysHover === true) && (
        <Stack direction="row-reverse" style={{ marginRight: 42 }}>
          <div style={{ position: "absolute", marginTop: 8 }}>
            <WishlistToolTip
              onMouseEnter={(): void => {
                setHover(true);
              }}
              onMouseLeave={(): void => {
                setHover(false);
              }}
            />
          </div>
        </Stack>
      )}
      {loggedIn === true &&
        (hover === true || alwaysHover === true) &&
        wishlist !== true && (
          <Stack direction="row-reverse" style={{ marginRight: 42 }}>
            <div style={{ position: "absolute", marginTop: 8 }}>
              <Heart
                className={styles.heart}
                onMouseEnter={(): void => {
                  setHover(true);
                }}
                onClick={(): void => {
                  onToggleWishList(`${objectId}_${variantIndex}`, true);
                  setWishList(true);
                }}
              />
            </div>
          </Stack>
        )}
      {loggedIn === true && wishlist === true && (
        <Stack direction="row-reverse" style={{ marginRight: 42 }}>
          <div style={{ position: "absolute", marginTop: 8 }}>
            <HeartFilled
              className={styles["heart-filled"]}
              onMouseEnter={(): void => {
                setHover(true);
              }}
              onClick={(): void => {
                onToggleWishList(`${objectId}_${variantIndex}`, false);
                setWishList(false);
              }}
            />
          </div>
        </Stack>
      )}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "black" }}
      >
        <Stack direction="column" rowAlign="flex-start" style={style}>
          <picture
            className={styles.picture}
            onMouseOver={(): void => {
              if (!hover) {
                setHover(true);
              }
            }}
            onMouseLeave={(): void => {
              setHover(false);
            }}
          >
            <img
              alt={name}
              loading={loading}
              src={variantImages[variantIndex].replace(
                "/upload",
                "/upload/w_400"
              )}
              width={175}
            />
          </picture>
          <h6 className={styles.h6}>{decode(business)}</h6>
          <h4 className={styles.h4}>{decode(name)}</h4>
          {priceRange[0] === priceRange[1] ? (
            <h5 className={styles.h5}>${priceRange[0].toFixed(2)} CAD</h5>
          ) : (
            <h5 className={styles.h5}>
              ${priceRange[0].toFixed(2)}-{priceRange[1].toFixed(2)} CAD
            </h5>
          )}
        </Stack>
      </a>
    </div>
  );
};

export default ProductImage;
