import { decode } from "html-entities";

import Stack from "components/common/Stack";
import styles from "components/common/business-image/BusinessImage.module.css";

import type { FC } from "react";

export interface BusinessImageProps
  extends React.HTMLProps<HTMLPictureElement> {
  name: string;
  src: string;
  height: number;
  width: number;
  loading?: "eager" | "lazy";
}

const BusinessImage: FC<BusinessImageProps> = ({
  name,
  src,
  height,
  width,
  loading,
}: BusinessImageProps) => {
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
      <h4 className={styles.h4}>{decode(name)}</h4>
    </Stack>
  );
};

export default BusinessImage;
