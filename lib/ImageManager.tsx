export {};

/*
DEPRECATED:
Turns out image caching on the server side
hurts our first paint speed based on SEO
checkers like Google Lighthouse
*/

/*
import LZString from "lz-string";
const requestBase64 = require("base64-img").requestBase64;

export interface CacheOptions {
  forever?: boolean;
  timeout: number; //seconds
}

let instance: ImageManger;
export default class ImageManger {
  static getInstance() {
    if (!instance) {
      instance = new ImageManger();
    }
    return instance;
  }

  private cache: Map<string, string>;
  private constructor() {
    this.cache = new Map<string, string>();
  }

  private addImage(url: string, options: CacheOptions) {
    requestBase64(
      url.replace("/upload", "/upload/w_400"),
      (err: any, res: any, body: string) => {
        if (err) {
          console.log(err);
          return;
        }

        // Store compressed version of the image
        const compressedBody = LZString.compressToBase64(body);
        this.cache.set(url, compressedBody);

        if (options.forever) {
          setTimeout(() => {
            this.addImage(url, options);
          }, options.timeout * 1000);
        } else {
          setTimeout(() => {
            this.cache.delete(url);
          }, options.timeout * 1000);
        }
      }
    );
  }

  getImage(url: string, options: CacheOptions = { timeout: 300 }): string {
    const image = this.cache.get(url) || url;
    if (image === url) {
      this.addImage(url, options);
    }
    return image;
  }
}
*/
