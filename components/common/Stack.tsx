import { Children } from "react";
import styled from "styled-components";

import type { FC, JSXElementConstructor, ReactElement } from "react";

export type StackDirection =
  | "column-reverse"
  | "column"
  | "row-reverse"
  | "row";
export type StackAlignment = "center" | "flex-end" | "flex-start";

export interface StackProps extends React.HTMLProps<HTMLDivElement> {
  direction: StackDirection;
  columnAlign?: StackAlignment;
  rowAlign?: StackAlignment;
  priority?: Array<number>;
  spacing?: number;
}

const directionToMargin = (direction: StackDirection): string => {
  switch (direction) {
    case "row":
      return "right";
    case "row-reverse":
      return "left";
    case "column":
      return "bottom";
    case "column-reverse":
      return "top";
  }
};

const Stack: FC<StackProps> = (props) => {
  return (
    <div {...props}>
      {Children.map(props.children, (child, index) => {
        return (
          <div
            className="stackitem"
            {...(props.priority && {
              style: { flexGrow: props.priority[index] },
            })}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default styled(
  ({
    columnAlign,
    rowAlign,
    ...rest
  }: StackProps): ReactElement<
    StackProps,
    JSXElementConstructor<StackProps>
  > => {
    // Refer to unused variables to stop
    // typescript from complaining
    void columnAlign, rowAlign;
    return <Stack {...rest} />;
  }
)`
    align-items: ${({ rowAlign }): string | undefined => rowAlign};
    display: flex;
    flex-wrap: ${({ wrap }): string | undefined => wrap};
    flex-direction: ${({ direction }): string | undefined => direction};
    justify-content: ${({ columnAlign }): string | undefined => columnAlign};
    > .stackitem {
        margin-${({ direction }): string | undefined =>
          directionToMargin(direction)}: ${({ spacing }): number | undefined =>
  spacing}px;
        &:last-child {
            margin-${({ direction }): string | undefined =>
              directionToMargin(direction)}: 0px;
        }
    }
`;
