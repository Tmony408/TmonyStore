const cloudinary = require('cloudinary');
// const { CloudinaryStorage } = require('multer-storage-cloudinary')


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  
})
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: 'TmonyStore',
//     allowedFormats: ['png', 'jpeg', 'jpg'], // supports promises as well
//   },
// });

// const cloudinaryUploadImage = async (filesToUpload) => {
//   return new Promise((resolve) => {
//     cloudinary.uploader.upload(filesToUpload, (result) => {
//       resolve({
//         url: result.secure_url,
//       }, {
//         resource_type: "auto",
//       })
//     })
//   })
// }

const cloudinaryUploadImage = async (filesToUpload) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filesToUpload, (result) => {

      resolve({
        url: result.secure_url,
      });
    })
    }, {
    resource_type: "auto",
  });
};




module.exports = cloudinaryUploadImage
