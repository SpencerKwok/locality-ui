import { Children } from "react";
import styled from "styled-components";

export type StackDirection =
  | "row"
  | "row-reverse"
  | "column"
  | "column-reverse";
export type StackAlignment = "flex-start" | "center" | "flex-end";

export interface StackProps extends React.HTMLProps<HTMLDivElement> {
  direction: StackDirection;
  columnAlign?: StackAlignment;
  rowAlign?: StackAlignment;
  priority?: Array<number>;
  spacing?: number;
}

const directionToMargin = (direction: StackDirection) => {
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

function Stack(props: StackProps) {
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
}

export default styled(({ columnAlign, rowAlign, ...rest }: StackProps) => (
  <Stack {...rest} />
))`
    align-items: ${({ rowAlign }) => rowAlign};
    display: flex;
    flex-wrap: ${({ wrap }) => wrap};
    flex-direction: ${({ direction }) => direction};
    justify-content: ${({ columnAlign }) => columnAlign};
    > .stackitem {
        margin-${({ direction }) => directionToMargin(direction)}: ${({
  spacing,
}) => spacing}px;
        &:last-child {
            margin-${({ direction }) => directionToMargin(direction)}: 0px;
        }
    }
`;
