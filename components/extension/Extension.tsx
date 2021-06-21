import React from "react";
import ImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import Button from "react-bootstrap/Button";
import "react-image-gallery/styles/css/image-gallery.css";

import Stack from "components/common/Stack";

const renderVideo = () => {
  return (
    <video width={"100%"} controls>
      <source
        src="https://res.cloudinary.com/hcory49pf/video/upload/v1615108481/demo/extension-v2.mp4"
        type="video/mp4"
      />
    </video>
  );
};

const renderItem = (item: ReactImageGalleryItem) => {
  return (
    <picture style={{ margin: 0 }}>
      <source srcSet={item.original} type="image/webp" />
      <img
        src={item.original.replace(".webp", ".jpg")}
        alt={item.originalAlt}
        width={"100%"}
      />
    </picture>
  );
};

const images = [
  {
    original:
      "https://res.cloudinary.com/hcory49pf/image/upload/v1615868532/demo/extension-slide-1.png",
    thumbnail:
      "https://res.cloudinary.com/hcory49pf/image/upload/v1615868532/demo/extension-slide-1.png",
    renderItem,
  },
  {
    original:
      "https://res.cloudinary.com/hcory49pf/image/upload/v1615871512/demo/extension-slide-2.png",
    thumbnail:
      "https://res.cloudinary.com/hcory49pf/image/upload/v1615871512/demo/extension-slide-2.png",
    renderItem,
  },
  {
    original:
      "https://res.cloudinary.com/hcory49pf/image/upload/v1615860788/demo/extension-slide-3.png",
    thumbnail:
      "https://res.cloudinary.com/hcory49pf/image/upload/v1615860788/demo/extension-slide-3.png",
    renderItem,
  },
  {
    original:
      "https://res.cloudinary.com/hcory49pf/image/upload/v1615866462/demo/extension-slide-4.png",
    thumbnail:
      "https://res.cloudinary.com/hcory49pf/image/upload/v1615866462/demo/extension-slide-4.png",
    renderItem: renderVideo,
  },
];

export default function Extension() {
  return (
    <Stack direction="row" columnAlign="center">
      <Stack direction="column" rowAlign="center">
        <header style={{ textAlign: "center" }}>
          <h1>Locality Chrome Extension</h1>
        </header>
        <main>
          <Stack
            direction="column"
            rowAlign="center"
            spacing={12}
            style={{ width: "100%", minWidth: 375, maxWidth: 800 }}
          >
            <p style={{ marginBottom: 0 }}>
              Instantly find products from locally owned small businesses with
              the Locality Chrome Extension!
            </p>
            <Button href="https://chrome.google.com/webstore/detail/locality/cklipomamlgjpmihfhfdjmlhnbadnedl?hl=en">
              Click here to Download!
            </Button>
            <ImageGallery
              items={images}
              slideDuration={1000}
              slideInterval={5000}
              autoPlay={true}
            />
          </Stack>
        </main>
      </Stack>
    </Stack>
  );
}
