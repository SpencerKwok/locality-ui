const cloudinary = require("cloudinary").v2;

exports.upload = async (file, options) => {
  let url = "";
  await cloudinary.uploader
    .upload(file, options)
    .then(({ secure_url }) => (url = secure_url))
    .catch((err) => console.log(err));
  return url;
};

exports.delete = async (public_ids) => {
  await cloudinary.api
    .delete_resources(public_ids)
    .catch((err) => console.log(err));
};
