export type Base64 = string;

export function fileToBase64(data: File | Blob): Promise<Base64> {
  if (!data.type.match(/^image\/.*$/g)) {
    throw Error("Invalid data type");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(data);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
