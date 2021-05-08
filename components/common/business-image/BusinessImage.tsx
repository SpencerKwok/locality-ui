import React from "react";
import LZString from "lz-string";

import Stack from "../Stack";
import styles from "./BusinessImage.module.css";

export interface BusinessImageProps
  extends React.HTMLProps<HTMLPictureElement> {
  name: string;
  src: string;
  height: number;
  width: number;
  cachedSrc?: string;
  loading?: "eager" | "lazy";
}

export default function BusinessImage({
  name,
  src,
  height,
  width,
  cachedSrc,
  loading,
}: BusinessImageProps) {
  let finalSrc = src.replace("upload/", "upload/w_175/");
  if (cachedSrc && src !== cachedSrc && loading === "eager") {
    finalSrc = LZString.decompressFromBase64(cachedSrc) as string;
  }

  return (
    <Stack
      direction="column"
      rowAlign="flex-start"
      style={{ height: height, width: width }}
    >
      <Stack direction="column" rowAlign="center" style={{ width: width }}>
        <picture className={styles.picture}>
          <img loading={loading} alt={name} src={finalSrc} width={width} />
        </picture>
      </Stack>
      <h4 className={styles.h4}>{name}</h4>
    </Stack>
  );
}
