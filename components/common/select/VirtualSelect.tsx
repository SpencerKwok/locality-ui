import { Children } from "react";
import Select, {
  createFilter,
  MenuListComponentProps,
  Props,
} from "react-select";
import { FixedSizeList } from "react-window";

interface MenuListProps<isMulti extends boolean>
  extends MenuListComponentProps<{}, isMulti> {}

function MenuList<isMulti extends boolean>({
  options,
  children,
  maxHeight,
  getValue,
}: MenuListProps<isMulti>) {
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
      {({ index, style }) => <div style={style}>{childrenArray[index]}</div>}
    </FixedSizeList>
  );
}

export interface VirtualSelectProps<isMulti extends boolean>
  extends Props<{}, isMulti> {}

export default function VirtualSelect<isMulti extends boolean>(
  props: VirtualSelectProps<isMulti>
) {
  return (
    <Select
      {...props}
      filterOption={createFilter({ ignoreAccents: false })}
      components={{ MenuList }}
    />
  );
}
