import React, { useState } from "react";
import Cookie from "js-cookie";
import styled, { keyframes } from "styled-components";
import Popup from "reactjs-popup";

import ProductImageDAO from "./ProductImageDAO";
import Stack from "../../Stack/Stack";
import { ReactComponent as Heart } from "./heart.svg";
import { ReactComponent as HeartFilled } from "./heart-fill.svg";

export interface ProductImageProps extends React.HTMLProps<HTMLDivElement> {
  company: string;
  link: string;
  name: string;
  objectId: string;
  priceRange: Array<number>;
  src: string;
  alwaysHover?: boolean;
  wishlist?: boolean;
}

const StyledH4 = styled.h4`
  font-size: 120%;
  margin: 0px;
`;
const StyledH5 = styled.h5`
  font-size: 100%;
  margin: 0px;
`;
const StyledH6 = styled.h6`
  font-size: 80%;
  margin: 4px 0px 0px 0px;
`;

const StyledPicture = styled.picture`
  align-items: center;
  display: flex;
  height: 225px;
  justify-content: center;
  overflow: hidden;
`;

const StyledHeart = styled(Heart)`
  position: absolute;
`;

const PopInAnimation = keyframes`
  0% {
    transform: scale3d(0,0,0);
  }
  75% {
    transform: scale3d(1.05,1.05,1.05);
  }
  100% {
    transform: scale3d(1,1,1);
  }
`;

const StyledHeartFilled = styled(HeartFilled)`
  position: absolute;
  transform-origin: center;
  animation: ${PopInAnimation} 0.2s ease;
`;

function ProductImage(props: ProductImageProps) {
  const username = Cookie.get("username");
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [lowResLoaded, setLowResLoaded] = useState(false);
  const [hover, setHover] = useState(props.alwaysHover || false);
  const [wishlist, setWishlist] = useState(props.wishlist || false);

  return (
    <React.Fragment>
      {wishlist && (
        <Stack direction="row-reverse" style={{ marginRight: 44 }}>
          <StyledHeartFilled
            onClick={async () => {
              setWishlist(false);
              await ProductImageDAO.getInstance()
                .deleteFromWishlist({
                  id: props.objectId,
                })
                .then(({ error }) => {
                  if (error) {
                    console.log(error);
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
            onMouseEnter={() => {
              setHover(true);
            }}
          />
        </Stack>
      )}
      {hover && !wishlist && (
        <Stack direction="row-reverse" style={{ marginRight: 44 }}>
          {username ? (
            <StyledHeart
              onClick={async () => {
                setWishlist(true);
                await ProductImageDAO.getInstance()
                  .addToWishlist({
                    id: props.objectId,
                  })
                  .then(({ error }) => {
                    if (error) {
                      console.log(error);
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }}
              onMouseEnter={() => {
                if (!props.alwaysHover) {
                  setHover(true);
                }
              }}
              onMouseLeave={() => {
                if (!props.alwaysHover) {
                  setHover(false);
                }
              }}
            />
          ) : (
            <Popup
              position="right center"
              trigger={
                <StyledHeart
                  onMouseEnter={() => {
                    setHover(true);
                  }}
                  onMouseLeave={() => {
                    setHover(false);
                  }}
                />
              }
            >
              <Stack direction="column" columnAlign="center" rowAlign="center">
                <p style={{ margin: "0px auto 0px auto" }}>
                  Want to save products? Sign up in the top right corner to
                  create your wishlist!
                </p>
              </Stack>
            </Popup>
          )}
        </Stack>
      )}
      <a
        href={props.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "black" }}
      >
        <Stack
          direction="column"
          rowAlign="flex-start"
          style={props.style}
          onMouseEnter={() => {
            if (!props.alwaysHover) {
              setHover(true);
            }
          }}
          onMouseLeave={() => {
            if (!props.alwaysHover) {
              setHover(false);
            }
          }}
        >
          <span>
            <StyledPicture
              {...((!lowResLoaded || highResLoaded) && {
                style: { display: "none" },
              })}
            >
              <source
                srcSet={props.src.replace("upload/", "upload/w_24/")}
                type="image/webp"
              />
              <img
                alt={props.name}
                loading={"eager"}
                onLoad={() => setLowResLoaded(true)}
                src={props.src.replace(".webp", ".jpg")}
                style={{ filter: "blur(1px)" }}
                width={175}
              />
            </StyledPicture>
            <StyledPicture
              {...(!highResLoaded && { style: { display: "none" } })}
            >
              <source
                srcSet={props.src.replace("upload/", "upload/w_480/")}
                type="image/webp"
              />
              <img
                alt={props.name}
                src={props.src.replace(".webp", ".jpg")}
                onLoad={() => setHighResLoaded(true)}
                width={175}
              />
            </StyledPicture>
          </span>
          <StyledH6>{props.company}</StyledH6>
          <StyledH4>{props.name}</StyledH4>
          {props.priceRange[0] === props.priceRange[1] ? (
            <StyledH5>${props.priceRange[0].toFixed(2)} CAD</StyledH5>
          ) : (
            <StyledH5>
              ${props.priceRange[0].toFixed(2)}-{props.priceRange[1].toFixed(2)}{" "}
              CAD
            </StyledH5>
          )}
        </Stack>
      </a>
    </React.Fragment>
  );
}

export default ProductImage;