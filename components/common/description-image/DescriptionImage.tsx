import { forwardRef } from "react";
import Stack, { StackProps } from "components/common/Stack";
import styles from "components/common/description-image/DescriptionImage.module.css";

import type { FC } from "react";

export interface DescriptionImageProps extends StackProps {
  loading?: "eager" | "lazy";
  src: string;
}

const DescriptionImage: FC<DescriptionImageProps> = (props) => {
  return (
    <Stack
      direction={props.direction}
      columnAlign={props.columnAlign}
      rowAlign={props.rowAlign}
      spacing={props.spacing}
      style={props.style}
      onClick={props.onClick}
    >
      <picture style={{ margin: 0 }}>
        <source
          srcSet={props.src.replace("upload/", "upload/w_400/")}
          type="image/webp"
        />
        <img
          src={props.src.replace(".webp", ".jpg")}
          alt={props.alt}
          loading={props.loading}
          style={{ maxHeight: props.height, maxWidth: props.width }}
        />
      </picture>
      <Stack direction="column">{props.children}</Stack>
    </Stack>
  );
};

export const LinkedDescriptionImage = forwardRef<
  HTMLAnchorElement,
  DescriptionImageProps
>(({ href, ...rest }, ref) => (
  <a className={styles.link} href={href} ref={ref}>
    <DescriptionImage {...rest} />
  </a>
));

export default DescriptionImage;
