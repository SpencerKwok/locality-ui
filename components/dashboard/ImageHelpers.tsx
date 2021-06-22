export type Base64 = string;

export async function fileToBase64(data: Blob | File): Promise<Base64> {
  if (!data.type.match(/^image\/.*$/g)) {
    throw Error("Invalid data type");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(data);
    reader.onload = (): void => {
      resolve(reader.result as string);
    };
    reader.onerror = (error): void => {
      reject(error);
    };
  });
}
