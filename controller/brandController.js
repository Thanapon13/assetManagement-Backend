const Brand = require("../models").brand;
const createError = require("../utils/createError");

exports.createBrand = async (req, res, next) => {
  try {
    const { brandArray } = req.body;

    const resBrand = [];

    for (let el of brandArray) {
      try {
        let brand = await Brand.create({
          name: el.name
        });
        resBrand.push(brand);
      } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
          // handle unique constraint error
          return next(createError(`name:${el.name} is already exist.`, 400));
        } else {
          // handle other errors
          return next(err);
        }
      }
    }

    res.json({ message: "create successfully", resBrand });
  } catch (err) {
    next(err);
  }
};

exports.getAllBrandrand = async (req, res, next) => {
  try {
    const brand = await Brand.findAll({
      attributes: ["_id", "name"]
    });
    res.json({ brand });
  } catch (err) {
    next(err);
  }
};

exports.updateBrand = async (req, res, next) => {
  try {
    const { brandArray } = req.body;
    //  const brandArrayObject = brandArray;
    const brandArrayObject = JSON.parse(brandArray);
    const resBrand = [];

    for (let i = 0; i < brandArrayObject.length; i++) {
      const { _id, name } = brandArrayObject[i];
      const brand = await Brand.findByPk(_id);

      if (!brand) {
        throw createError(`Brand with id ${_id} not found`, 404);
      }

      const existingNameBrand = await Brand.findOne({
        where: { name: name }
      });
      // console.log("existingNameBrand", existingNameBrand);
      // console.log("existingNameBrand.id", existingNameBrand.id);
      if (existingNameBrand && existingNameBrand.id !== _id) {
        throw createError(`Brand with name '${name}' already exists`, 400);
      }

      brand.name = name;
      await brand.save();
      resBrand.push(brand);
    }

    res.json({ message: "update successfully", resBrand });
  } catch (err) {
    next(err);
  }
};

exports.getAllBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findAll({
      attributes: ["_id", "name"]
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteBrand = async (req, res, next) => {
  try {
    const _id = req.params.brandId;
    let brand = await Brand.destroy({
      where: {
        _id: _id
      }
    });
    res.json({ message: "delete brand successfully", brand });
  } catch (err) {
    next(err);
  }
};
