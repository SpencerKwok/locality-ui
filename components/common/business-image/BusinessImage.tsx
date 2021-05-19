import React from "react";

import Stack from "../Stack";
import styles from "./BusinessImage.module.css";

export interface BusinessImageProps
  extends React.HTMLProps<HTMLPictureElement> {
  name: string;
  src: string;
  height: number;
  width: number;
  loading?: "eager" | "lazy";
}

export default function BusinessImage({
  name,
  src,
  height,
  width,
  loading,
}: BusinessImageProps) {
  return (
    <Stack
      direction="column"
      rowAlign="flex-start"
      style={{ height: height, width: width }}
    >
      <Stack direction="column" rowAlign="center" style={{ width: width }}>
        <picture className={styles.picture}>
          <img
            loading={loading}
            alt={name}
            src={src.replace("upload/", "upload/w_200/")}
            width={width}
          />
        </picture>
      </Stack>
      <h4 className={styles.h4}>{name}</h4>
    </Stack>
  );
}
