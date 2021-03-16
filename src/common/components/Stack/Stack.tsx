import React, { Children } from "react";
import styled from "styled-components";

export type StackDirection =
  | "row"
  | "row-reverse"
  | "column"
  | "column-reverse";
export type StackAlignment = "flex-start" | "center" | "flex-end";
export type StackWrap = "nowrap" | "wrap" | "wrap-reverse";

export interface StackProps extends React.HTMLProps<HTMLElement> {
  direction: StackDirection;
  columnAlign?: StackAlignment;
  minWidth?: number;
  maxWidth?: number;
  width?: number;
  height?: number;
  priority?: Array<number>;
  rowAlign?: StackAlignment;
  spacing?: number;
  wrap?: StackWrap;
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
    <div className={props.className} style={props.style || {}}>
      {Children.map(props.children, (child, index) => {
        const flexStyle =
          props.priority && index < props.priority.length
            ? { flexGrow: props.priority[index] }
            : {};
        return (
          <div className="stackitem" style={flexStyle}>
            {child}
          </div>
        );
      })}
    </div>
  );
}

export default styled(Stack)`
    align-items: ${({ rowAlign }) => rowAlign};
    display: flex;
    flex-wrap: ${({ wrap }) => wrap};
    flex-direction: ${({ direction }) => direction};
    height: ${({ height }) => height}px;
    width: ${({ width }) => width}px;
    min-width: ${({ minWidth }) => minWidth}px;
    max-width: ${({ maxWidth }) => maxWidth}px;
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
