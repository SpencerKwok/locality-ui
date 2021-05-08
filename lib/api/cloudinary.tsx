import { v2 as Cloudinary } from "cloudinary";

const cloudinaryClient: { [key: string]: any } = {};
cloudinaryClient.upload = async (file: string, options = {}) => {
  let url,
    error = null;
  await Cloudinary.uploader
    .upload(file, options)
    .then(({ secure_url }) => (url = secure_url))
    .catch((err) => {
      console.log(err);
      error = err.message;
    });
  return [url, error];
};

cloudinaryClient.deleteResources = async (public_ids: string[]) => {
  let error = null;
  await Cloudinary.api.delete_resources(public_ids).catch((err) => {
    console.log(err);
    error = err.message;
  });
  return error;
};

export default cloudinaryClient;
