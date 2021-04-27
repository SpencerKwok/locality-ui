import React from "react";

import Stack from "../Stack";
import styles from "./CompanyImage.module.css";

export interface CompanyImageProps extends React.HTMLProps<HTMLPictureElement> {
  name: string;
  src: string;
  height: number;
  width: number;
}

export default function CompanyImage({
  name,
  src,
  height,
  width,
}: CompanyImageProps) {
  return (
    <Stack
      direction="column"
      rowAlign="flex-start"
      style={{ height: height, width: width }}
    >
      <Stack direction="column" rowAlign="center" style={{ width: width }}>
        <picture className={styles.picture}>
          <source
            srcSet={src.replace("upload/", "upload/w_400/")}
            type="image/webp"
          />
          <img alt={name} src={src.replace(".webp", ".jpg")} width={width} />
        </picture>
      </Stack>
      <h4 className={styles.h4}>{name}</h4>
    </Stack>
  );
}
