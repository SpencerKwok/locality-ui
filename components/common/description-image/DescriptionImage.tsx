import { forwardRef } from "react";
import Stack, { StackProps } from "../Stack";
import styles from "./DescriptionImage.module.css";

export interface DescriptionImageProps extends StackProps {
  src: string;
}

export default function DescriptionImage(props: DescriptionImageProps) {
  return (
    <Stack
      direction={props.direction}
      columnAlign={props.columnAlign}
      rowAlign={props.rowAlign}
      spacing={props.spacing}
      style={props.style}
    >
      <picture style={{ margin: 0 }}>
        <source
          srcSet={props.src.replace("upload/", "upload/w_400/")}
          type="image/webp"
        />
        <img
          src={props.src.replace(".webp", ".jpg")}
          alt={props.alt}
          width={props.width}
        />
      </picture>
      <Stack direction="column">{props.children}</Stack>
    </Stack>
  );
}

export const LinkedDescriptionImage = forwardRef<
  HTMLAnchorElement,
  DescriptionImageProps
>(({ href, ...rest }, ref) => (
  <a className={styles.link} href={href} ref={ref}>
    <DescriptionImage {...rest} />
  </a>
));
