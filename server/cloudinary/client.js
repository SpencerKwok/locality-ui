const cloudinary = require("cloudinary").v2;

exports.upload = async (file, options) => {
  let url = "";
  await cloudinary.uploader
    .upload(file, options)
    .then(({ secure_url }) => (url = secure_url))
    .catch((err) => console.log(err));
  return url;
};
