export const DepartmentsToId = new Map<string, number>([
  ["Accessories/Jewelry", 1],
  ["Bags", 2],
  ["Baby", 3],
  ["Beauty & Personal Care", 4],
  ["Clothing/Shoes", 5],
  ["Entertainment", 6],
  ["Electronics", 7],
  ["Everything Else/Other", 8],
  ["Fitness", 9],
  ["Food & Drinks", 10],
  ["Groceries", 11],
  ["Health & Personal Care", 12],
  ["Home & Kitchen", 13],
  ["Pet", 14],
  ["Sports & Outdoors", 15],
  ["Toys & Games", 16],
]);

export const Departments = Array.from(DepartmentsToId.entries()).map(
  (value) => {
    return {
      id: value[1],
      name: value[0],
    };
  }
);
