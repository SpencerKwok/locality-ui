// Adding missing modules for back-end
declare module "doublemetaphone" {
  class DoubleMetaphone {
    public constructor();

    public doubleMetaphone(str: string): { primary: string; alternate: string };
  }
  export = DoubleMetaphone;
}

// Adding module css since it isn't declared in next.js
declare module "*.module.css";

// Adding fixed length array type as seen here:
// https://stackoverflow.com/questions/41139763/how-to-declare-a-fixed-length-array-in-typescript
type ArrayLengthMutationKeys =
  | number
  | "pop"
  | "push"
  | "shift"
  | "splice"
  | "unshift";
type ArrayItems<T extends Array<any>> = T extends Array<infer TItems>
  ? TItems
  : never;
type FixedLengthArray<T extends Array<any>> = Pick<
  T,
  Exclude<keyof T, ArrayLengthMutationKeys>
> & { [Symbol.iterator]: () => IterableIterator<ArrayItems<T>> };

// Adding non-empty array type as seen here:
// https://stackoverflow.com/questions/56006111/is-it-possible-to-define-a-non-empty-array-type-in-typescript
type NonEmptyArray<T> = [T, ...Array<T>];
