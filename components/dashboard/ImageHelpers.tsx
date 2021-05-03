export type Base64 = string;

export function fileToBase64(data: File | Blob): Promise<Base64> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(data);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export async function urlToBase64(url: string): Promise<Base64> {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((data) => data.blob())
      .then((blob) => fileToBase64(blob))
      .then((value) => resolve(value))
      .catch((error) => reject(error));
  });
}