const PurposeOfUse = require("../models").purposeOfUse;
const createError = require("../utils/createError");

exports.createPurposeOfUse = async (req, res, next) => {
  try {
    const { purposeOfUseArray } = req.body;
    const purposeOfUseArrayObject = JSON.parse(purposeOfUseArray);

    const resPurposeOfUse = [];

    for (let el of purposeOfUseArrayObject) {
      try {
        let purposeOfUse = await PurposeOfUse.create({
          name: el.name,
        });
        resPurposeOfUse.push(purposeOfUse);
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
    res.json({ resPurposeOfUse });
  } catch (err) {
    next(err);
  }
};

exports.updatePurposeOfUse = async (req, res, next) => {
  try {
    const { purposeOfUseArray } = req.body;
    // const purposeOfUseArrayObject = purposeOfUseArray;
    const purposeOfUseArrayObject = JSON.parse(purposeOfUseArray);
    const resPurposeOfUse = [];

    for (let i = 0; i < purposeOfUseArrayObject.length; i++) {
      const { _id, name } = purposeOfUseArrayObject[i];
      const purposeOfUse = await PurposeOfUse.findByPk(_id);

      if (!purposeOfUse) {
        throw createError(`PurposeOfUse with id ${_id} not found`, 404);
      }

      const existingNamePurposeOfUse = await PurposeOfUse.findOne({
        where: { name: name },
      });
      // console.log("existingNamePurposeOfUse", existingNamePurposeOfUse);
      // console.log("existingNamePurposeOfUse.id", existingNamePurposeOfUse.id);
      if (existingNamePurposeOfUse && existingNamePurposeOfUse._id !== _id) {
        throw createError(
          `PurposeOfUse with name '${name}' already exists`,
          400
        );
      }

      purposeOfUse.name = name;
      await purposeOfUse.save();
      resPurposeOfUse.push(purposeOfUse);
    }

    res.json({ message: "update successfully", resPurposeOfUse });
  } catch (err) {
    next(err);
  }
};

exports.getAllPurposeOfUse = async (req, res, next) => {
  try {
    const purposeOfUse = await PurposeOfUse.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ purposeOfUse });
  } catch (err) {
    next(err);
  }
};

exports.deletePurposeOfUse = async (req, res, next) => {
  try {
    const _id = req.params.purposeOfUseId;
    let purposeOfUse = await PurposeOfUse.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ message: "delete purposeOfUse successfully", purposeOfUse });
  } catch (err) {
    next(err);
  }
};
