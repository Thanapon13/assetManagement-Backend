const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // console.log(file, "filemulter");
    if (file.fieldname === "arrayDocument") {
      cb(null, "public/documents");
    } else {
      cb(null, "public/pics");
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

//   module.exports = multer({ storage }).array("file");
module.exports = multer({ storage });
