const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
require("../public/uploads/user");

const storage = (fname) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./public/uploads/&{fname}`);
    },
    filename: function (req, file, cb) {
      cb(null, `${uuidv4()}_${path.extname(file.originalname)}`);
    },
  });

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/svg",
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploadMiddleware = multer({ storage, fileFilter });
module.exports = uploadMiddleware;
