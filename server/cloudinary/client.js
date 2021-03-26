import { v2 as cloudinary } from "cloudinary";

const cloudinaryClient = {};
cloudinaryClient.upload = async (file, options) => {
  let url,
    error = null;
  await cloudinary.uploader
    .upload(file, options)
    .then(({ secure_url }) => (url = secure_url))
    .catch((err) => {
      console.log(err);
      error = {
        code: 500,
        message: err.message,
      };
    });
  return [url, error];
};

cloudinaryClient.deleteResources = async (public_ids) => {
  let error = null;
  await cloudinary.api.delete_resources(public_ids).catch((err) => {
    console.log(err);
    error = {
      code: 500,
      message: err.message,
    };
  });
  return error;
};

export default cloudinaryClient;
