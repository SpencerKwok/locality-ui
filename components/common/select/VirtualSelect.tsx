import { Children } from "react";
import Select, {
  createFilter,
  MenuListComponentProps,
  Props,
} from "react-select";
import { FixedSizeList } from "react-window";

import type {
  HTMLProps,
  JSXElementConstructor,
  PropsWithChildren,
  ReactElement,
} from "react";

type MenuListProps<
  T extends {},
  isMulti extends boolean
> = MenuListComponentProps<T, isMulti>;

function MenuList<T extends {}, isMulti extends boolean>({
  options,
  children,
  maxHeight,
  getValue,
}: PropsWithChildren<MenuListProps<T, isMulti>>): ReactElement<
  PropsWithChildren<MenuListProps<T, isMulti>>
> {
  const [value] = getValue();
  const height = 35;
  const initialOffset = options.indexOf(value) * height;
  const childrenArray = Children.toArray(children);

  return (
    <FixedSizeList
      height={maxHeight}
      width={"100%"}
      itemCount={childrenArray.length}
      itemSize={height}
      initialScrollOffset={initialOffset}
    >
      {({
        index,
        style,
      }): ReactElement<
        HTMLProps<HTMLDivElement>,
        JSXElementConstructor<HTMLDivElement>
      > => <div style={style}>{childrenArray[index]}</div>}
    </FixedSizeList>
  );
}

export type VirtualSelectProps<T extends {}, isMulti extends boolean> = Props<
  T,
  isMulti
>;

export default function VirtualSelect<T extends {}, isMulti extends boolean>(
  props: VirtualSelectProps<T, isMulti>
): ReactElement<PropsWithChildren<VirtualSelectProps<T, isMulti>>> {
  return (
    <Select
      {...props}
      filterOption={createFilter({ ignoreAccents: false })}
      components={{ MenuList }}
    />
  );
}
