const PersonnelTypeCode = require("../models").personnelTypeCode;
const createError = require("../utils/createError");

exports.createPersonnelTypeCode = async (req, res, next) => {
  try {
    const { personnelTypeCodeArray } = req.body;
    // const personnelTypeCodeArrayObject = personnelTypeCodeArray;
    const personnelTypeCodeArrayObject = JSON.parse(personnelTypeCodeArray);
    const resPersonnelTypeCode = [];

    for (let el of personnelTypeCodeArrayObject) {
      try {
        let personnelTypeCode = await PersonnelTypeCode.create({
          name: el.name,
        });
        resPersonnelTypeCode.push(personnelTypeCode);
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
    res.json({ resPersonnelTypeCode });
  } catch (err) {
    next(err);
  }
};

exports.updatePersonnelTypeCode = async (req, res, next) => {
  try {
    const { personnelTypeCodeArray } = req.body;
    // const personnelTypeCodeArrayObject = personnelTypeCodeArray;
    const personnelTypeCodeArrayObject = JSON.parse(personnelTypeCodeArray);
    const resPersonnelTypeCode = [];

    for (let i = 0; i < personnelTypeCodeArrayObject.length; i++) {
      const { _id, name } = personnelTypeCodeArrayObject[i];
      const personnelTypeCode = await PersonnelTypeCode.findByPk(_id);

      if (!personnelTypeCode) {
        throw createError(`PersonnelTypeCode with id ${_id} not found`, 404);
      }

      const existingNamePersonnelTypeCode = await PersonnelTypeCode.findOne({
        where: { name: name },
      });
      // console.log("existingNamePersonnelTypeCode", existingNamePersonnelTypeCode);
      // console.log("existingNamePersonnelTypeCode.id", existingNamePersonnelTypeCode.id);
      if (
        existingNamePersonnelTypeCode &&
        existingNamePersonnelTypeCode._id !== _id
      ) {
        throw createError(
          `PersonnelTypeCode with name '${name}' already exists`,
          400
        );
      }

      personnelTypeCode.name = name;
      await personnelTypeCode.save();
      resPersonnelTypeCode.push(personnelTypeCode);
    }

    res.json({ message: "update successfully", resPersonnelTypeCode });
  } catch (err) {
    next(err);
  }
};

exports.getAllPersonnelTypeCode = async (req, res, next) => {
  try {
    const personnelTypeCode = await PersonnelTypeCode.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ personnelTypeCode });
  } catch (err) {
    next(err);
  }
};

exports.deletePersonnelTypeCode = async (req, res, next) => {
  try {
    const _id = req.params.personnelTypeCodeId;
    let personnelTypeCode = await PersonnelTypeCode.destroy({
      where: {
        _id: _id,
      },
    });
    res.json({
      message: "delete personnelTypeCode successfully",
      personnelTypeCode,
    });
  } catch (err) {
    next(err);
  }
};
