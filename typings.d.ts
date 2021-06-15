// Adding module css since it isn't declared in next.js
declare module "*.module.css";

// Adding fixed length array type as seen here:
// https://stackoverflow.com/questions/41139763/how-to-declare-a-fixed-length-array-in-typescript
type ArrayLengthMutationKeys =
  | "splice"
  | "push"
  | "pop"
  | "shift"
  | "unshift"
  | number;
type ArrayItems<T extends Array<any>> = T extends Array<infer TItems>
  ? TItems
  : never;
type FixedLengthArray<T extends any[]> = Pick<
  T,
  Exclude<keyof T, ArrayLengthMutationKeys>
> & { [Symbol.iterator]: () => IterableIterator<ArrayItems<T>> };
