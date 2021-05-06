import { useState } from "react";
import dynamic from "next/dynamic";

import Stack from "../Stack";
import styles from "./ProductImage.module.css";

const Heart = dynamic(() => import("../images/Heart"));
const HeartFilled = dynamic(() => import("../images/HeartFilled"));
const WishlistToolTip = dynamic(() => import("./WishlistToolTip"));

export interface ProductImageProps extends React.HTMLProps<HTMLDivElement> {
  company: string;
  link: string;
  name: string;
  objectId: string;
  priceRange: Array<number>;
  src: string;
  onToggleWishList: (id: string, value: boolean) => void;
  alwaysHover?: boolean;
  initialWishList?: boolean;
  loggedIn?: boolean;
}

function ProductImage({
  company,
  link,
  name,
  objectId,
  priceRange,
  src,
  onToggleWishList,
  alwaysHover,
  initialWishList,
  loggedIn,
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
                onToggleWishList(objectId, true);
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
                onToggleWishList(objectId, false);
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
            <source
              srcSet={src.replace("/upload", "/upload/w_400")}
              type="image/webp"
            />
            <img alt={name} src={src.replace(".webp", ".jpg")} width={175} />
          </picture>
          <h6 className={styles.h6}>{company}</h6>
          <h4 className={styles.h4}>{name}</h4>
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
