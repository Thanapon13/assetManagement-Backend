const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // console.log(file, "filemulter");
    if (file.fieldname === "arrayImage" || file.fieldname === "arrayDocument") {
      cb(null, "public/documents");
    } // console.log(file, "filemulter");
    else {
      cb(null, "public/pics");
    }
  },
  filename: (req, file, cb) => {
    // console.log("req", req);
    // console.log("-----------------------------");
    // console.log("-----------------------------");
    // console.log("file", file);
    cb(null, Date.now() + "-" + file.originalname);

    // cb(
    //   null,
    //   new Date().getTime() +
    //     "" +
    //     Math.round(Math.random() * 1000000000) +
    //     "." +
    //     file.mimetype.split("/")[1]
    // );
  }
});

//   module.exports = multer({ storage }).array("file");
module.exports = multer({ storage });
