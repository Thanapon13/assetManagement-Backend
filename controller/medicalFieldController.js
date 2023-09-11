const MedicalField = require("../models").medicalField;
const createError = require("../utils/createError");

exports.createMedicalField = async (req, res, next) => {
  try {
    const { medicalFieldArray } = req.body;
    // const medicalFieldArrayObject = medicalFieldArray;
    const resMedicalField = [];

    for (let el of medicalFieldArray) {
      try {
        let medicalField = await MedicalField.create({
          name: el.name,
        });
        resMedicalField.push(medicalField);
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
    res.json({ resMedicalField });
  } catch (err) {
    next(err);
  }
};

exports.updateMedicalField = async (req, res, next) => {
  try {
    const { medicalFieldArray } = req.body;
    // const medicalFieldArrayObject = medicalFieldArray;
    const resMedicalField = [];

    for (let i = 0; i < medicalFieldArray.length; i++) {
      const { _id, name } = medicalFieldArray[i];
      const medicalField = await MedicalField.findByPk(_id);

      if (!medicalField) {
        throw createError(`MedicalField with id ${_id} not found`, 404);
      }

      const existingNameMedicalField = await MedicalField.findOne({
        where: { name: name },
      });
      // console.log("existingNameMedicalField", existingNameMedicalField);
      // console.log("existingNameMedicalField.id", existingNameMedicalField.id);
      if (existingNameMedicalField && existingNameMedicalField.id !== _id) {
        throw createError(
          `MedicalField with name '${name}' already exists`,
          400
        );
      }

      medicalField.name = name;
      await medicalField.save();
      resMedicalField.push(medicalField);
    }

    res.json({ message: "update successfully", resMedicalField });
  } catch (err) {
    next(err);
  }
};

exports.getAllMedicalField = async (req, res, next) => {
  try {
    const medicalField = await MedicalField.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ medicalField });
  } catch (err) {
    next(err);
  }
};

exports.deleteMedicalField = async (req, res, next) => {
  try {
    const _id = req.params.medicalFieldId;
    let medicalField = await MedicalField.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ message: "delete medicalField successfully", medicalField });
  } catch (err) {
    next(err);
  }
};
