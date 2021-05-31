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

cloudinaryClient.deleteFolder = async (path: string, options = {}) => {
  let error = null;
  await Cloudinary.api
    .resources({
      type: "upload",
      prefix: path,
    })
    .then(async ({ resources }) => {
      const publicIds = resources.map(({ public_id }: any) => public_id);
      if (publicIds.length > 0) {
        const deleteResources = await cloudinaryClient.deleteResources(
          publicIds
        );
        // Don't throw error on failed deletes,
        // deleting resources doesn't affect
        // the client
        if (deleteResources.error) {
          console.log(deleteResources.error);
        }
        const deleteFolder = await Cloudinary.api.delete_folder(path, options);
        if (deleteFolder) {
          console.log(deleteFolder.error);
        }
      }
    })
    .catch((err) => {
      console.log(err);
      error = err.message;
    });
  return error;
};

export default cloudinaryClient;
