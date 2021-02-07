import React, { Children, HTMLProps } from "react";
import styled from "styled-components";

export type StackDirection = "horizontal" | "vertical";
export type StackAlignment = "flex-start" | "center" | "flex-end";

export interface StackProps extends HTMLProps<HTMLElement> {
  direction: StackDirection;
  columnAlign?: StackAlignment;
  height?: number;
  priority?: Array<number>;
  rowAlign?: StackAlignment;
  spacing?: number;
}

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
    flex-direction: ${({ direction }) =>
      direction === "horizontal" ? "row" : "column"};
    height: ${({ height }) => height}px;
    justify-content: ${({ columnAlign }) => columnAlign};
    > .stackitem {
        margin: ${({ spacing }) => spacing}px;
        &:last-child {
            margin-${({ direction }) =>
              direction === "horizontal" ? "right" : "bottom"}: 0px;
        }
    }
`;
