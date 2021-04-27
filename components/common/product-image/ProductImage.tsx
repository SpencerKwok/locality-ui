import React, { useState } from "react";

import Heart from "../images/Heart";
import Popup from "reactjs-popup";
import Stack from "../Stack";
import styles from "./ProductImage.module.css";
import "reactjs-popup/dist/index.css";

export interface ProductImageProps extends React.HTMLProps<HTMLDivElement> {
  company: string;
  link: string;
  name: string;
  objectId: string;
  priceRange: Array<number>;
  src: string;
}

function ProductImage(props: ProductImageProps) {
  const [hover, setHover] = useState(false);
  return (
    <div>
      {hover && (
        <Stack direction="row-reverse" style={{ marginRight: 42 }}>
          <div style={{ position: "absolute", marginTop: 8 }}>
            <Popup
              contentStyle={{
                marginTop: 16,
                marginLeft: 14,
                padding: 0,
                width: 220,
              }}
              position="right center"
              on={["hover"]}
              trigger={
                <div>
                  <Heart
                    className={styles.heart}
                    onMouseEnter={() => {
                      setHover(true);
                    }}
                  />
                </div>
              }
            >
              <p
                style={{ textAlign: "center", padding: 8, margin: 0 }}
                onMouseLeave={() => {
                  setHover(false);
                }}
              >
                Want to save products? Sign up in the top right corner to create
                your wishlist!
              </p>
            </Popup>
          </div>
        </Stack>
      )}
      <a
        href={props.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "black" }}
      >
        <Stack direction="column" rowAlign="flex-start" style={props.style}>
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
              srcSet={props.src.replace("upload/", "upload/w_400/")}
              type="image/webp"
            />
            <img
              alt={props.name}
              src={props.src.replace(".webp", ".jpg")}
              width={175}
            />
          </picture>
          <h6 className={styles.h6}>{props.company}</h6>
          <h4 className={styles.h4}>{props.name}</h4>
          {props.priceRange[0] === props.priceRange[1] ? (
            <h5 className={styles.h5}>${props.priceRange[0].toFixed(2)} CAD</h5>
          ) : (
            <h5 className={styles.h5}>
              ${props.priceRange[0].toFixed(2)}-{props.priceRange[1].toFixed(2)}{" "}
              CAD
            </h5>
          )}
        </Stack>
      </a>
    </div>
  );
}

export default ProductImage;
