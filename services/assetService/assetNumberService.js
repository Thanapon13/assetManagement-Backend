// const Category = require(".../models").category;
// const Kind = require(".../models").kind;
// const Type = require("../models").type;

// const generateAssetNumber = async (input) => {
//   const category = await Category.findOne({name : input.category});
//   const kind = await Kind.findOne({name : input.kind});
//   const type = await Type.findOne({name : input.type});

//   return jwt.sign({ userData }, process.env.REFRESH_TOKEN, {
//     expiresIn: process.env.JWT_EXPIRES_IN_REFRESH_TOKEN,
//   });
// };

// const generatePackageAssetNumber = (userData) => {
//   return jwt.sign({ userData }, process.env.REFRESH_TOKEN, {
//     expiresIn: process.env.JWT_EXPIRES_IN_REFRESH_TOKEN,
//   });
// };

// module.exports = { generateAssetNumber, generatePackageAssetNumber };
