import { v2 as Cloudinary } from "cloudinary";

import SumoLogic from "lib/api/sumologic";

import type { AdminApiOptions, UploadApiOptions } from "cloudinary";

const cloudinaryClient: {
  upload: (file: string, options?: UploadApiOptions) => Promise<string | null>;
  deleteResources: (public_ids: Array<string>) => Promise<Error | null>;
  deleteFolder: (
    path: string,
    options: AdminApiOptions
  ) => Promise<Error | null>;
} = {
  upload: async (file, options) => {
    let url: string | null = null;
    await Cloudinary.uploader
      .upload(file, options)
      .then(({ secure_url }) => (url = secure_url))
      .catch((err) => {
        SumoLogic.log({
          level: "error",
          message: `Failed to upload file to Cloudinary: ${err.message}`,
          params: { file, options },
        });
      });
    return url;
  },
  deleteResources: async (public_ids) => {
    let error: Error | null = null;
    await Cloudinary.api.delete_resources(public_ids).catch((err) => {
      SumoLogic.log({
        level: "error",
        message: `Failed to upload file to Cloudinary: ${err.message}`,
        params: { public_ids },
      });
      error = err.message;
    });
    return error;
  },
  deleteFolder: async (path, options) => {
    let error: Error | null = null;
    await Cloudinary.api
      .resources({
        type: "upload",
        prefix: path,
      })
      .then(async ({ resources }) => {
        const publicIds: Array<string> = resources.map(
          ({ public_id }: { public_id: string }) => public_id
        );
        if (publicIds.length > 0) {
          const deleteResources = await cloudinaryClient.deleteResources(
            publicIds
          );
          // Don't throw error on failed deletes,
          // it doesn't affect the client
          if (deleteResources) {
            SumoLogic.log({
              level: "warning",
              message: `Failed to delete files from Cloudinary: ${deleteResources.message}`,
              params: { path },
            });
          }
          const deleteFolder = await Cloudinary.api
            .delete_folder(path, options)
            .catch((error) => {
              SumoLogic.log({
                level: "warning",
                message: "Failed to delete folder from Cloudinary",
                params: { path, error },
              });
            });

          // Don't throw error on failed deletes,
          // it doesn't affect the client
          if (
            deleteFolder?.error !== null &&
            deleteFolder?.error !== undefined
          ) {
            SumoLogic.log({
              level: "warning",
              message: "Failed to delete folder from Cloudinary",
              params: { path, response: deleteFolder },
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        error = err.message;
      });
    return error;
  },
};

export default cloudinaryClient;
