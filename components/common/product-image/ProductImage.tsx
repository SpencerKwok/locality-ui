import { useState } from "react";
import dynamic from "next/dynamic";
import { decode } from "html-entities";

import Heart from "../images/Heart";
import HeartFilled from "../images/HeartFilled";
import Stack from "../Stack";
import styles from "./ProductImage.module.css";

const WishlistToolTip = dynamic(() => import("./WishlistToolTip"));

export interface ProductImageProps extends React.HTMLProps<HTMLDivElement> {
  alwaysHover?: boolean;
  business: string;
  initialWishList?: boolean;
  link: string;
  loading?: "eager" | "lazy";
  loggedIn?: boolean;
  name: string;
  objectId: string;
  priceRange: Array<number>;
  variantImages: Array<string>;
  variantIndex: number;
  onToggleWishList: (id: string, value: boolean) => void;
}

function ProductImage({
  alwaysHover,
  business,
  initialWishList,
  link,
  loggedIn,
  loading,
  name,
  objectId,
  onToggleWishList,
  priceRange,
  variantImages,
  variantIndex,
  style,
}: ProductImageProps) {
  const [hover, setHover] = useState(false);
  const [wishlist, setWishList] = useState(initialWishList);

  return (
    <div key={objectId}>
      {!loggedIn && (hover || alwaysHover) && (
        <Stack direction="row-reverse" style={{ marginRight: 42 }}>
          <div style={{ position: "absolute", marginTop: 8 }}>
            <WishlistToolTip
              onMouseEnter={() => {
                setHover(true);
              }}
              onMouseLeave={() => {
                setHover(false);
              }}
            />
          </div>
        </Stack>
      )}
      {loggedIn && (hover || alwaysHover) && !wishlist && (
        <Stack direction="row-reverse" style={{ marginRight: 42 }}>
          <div style={{ position: "absolute", marginTop: 8 }}>
            <Heart
              className={styles.heart}
              onMouseEnter={() => {
                setHover(true);
              }}
              onClick={() => {
                onToggleWishList(`${objectId}_${variantIndex}`, true);
                setWishList(true);
              }}
            />
          </div>
        </Stack>
      )}
      {loggedIn && wishlist && (
        <Stack direction="row-reverse" style={{ marginRight: 42 }}>
          <div style={{ position: "absolute", marginTop: 8 }}>
            <HeartFilled
              className={styles["heart-filled"]}
              onMouseEnter={() => {
                setHover(true);
              }}
              onClick={() => {
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
            onMouseOver={() => {
              if (!hover) {
                setHover(true);
              }
            }}
            onMouseLeave={() => {
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
}

export default ProductImage;
