import React from "react";

import Stack from "../../common/components/Stack/Stack";
import ImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import { Button } from "react-bootstrap";

import "react-image-gallery/styles/css/image-gallery.css";

const renderVideo = (item: ReactImageGalleryItem) => {
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
      "https://res.cloudinary.com/hcory49pf/image/upload/v1615860788/demo/extension-slide-2.png",
    thumbnail:
      "https://res.cloudinary.com/hcory49pf/image/upload/v1615860788/demo/extension-slide-2.png",
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

export interface ExtensionProps extends React.HTMLProps<HTMLDivElement> {
  width: number;
}

function Extension(props: ExtensionProps) {
  return (
    <Stack direction="row" columnAlign="center">
      <Stack direction="column" rowAlign="center" style={{ marginTop: 24 }}>
        <header style={{ textAlign: "center" }}>
          <h1>Locality Chrome Extension</h1>
        </header>
        <main>
          <Stack
            direction="column"
            rowAlign="center"
            width={props.width * 0.5}
            spacing={12}
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
            />
          </Stack>
        </main>
      </Stack>
    </Stack>
  );
}

export default Extension;
