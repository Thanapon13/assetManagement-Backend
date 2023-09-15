const AcquisitionMethod = require("../models").acquisitionMethod;
const createError = require("../utils/createError");

exports.createAcquisitionMethod = async (req, res, next) => {
  try {
    const { acquisitionMethodArray } = req.body;
    const resAcquisitionMethod = [];
    const acquisitionMethodArrayObject = JSON.parse(acquisitionMethodArray);

    for (let el of acquisitionMethodArrayObject) {
      try {
        let acquisitionMethod = await AcquisitionMethod.create({
          name: el.name,
        });
        resAcquisitionMethod.push(acquisitionMethod);
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

    res.json({ resAcquisitionMethod });
  } catch (err) {
    next(err);
  }
};

exports.updateAcquisitionMethod = async (req, res, next) => {
  try {
    const { acquisitionMethodArray } = req.body;
    // const acquisitionMethodArrayObject = acquisitionMethodArray;
    const acquisitionMethodArrayObject = JSON.parse(acquisitionMethodArray);
    const resAcquisitionMethod = [];

    for (let i = 0; i < acquisitionMethodArrayObject.length; i++) {
      const { _id, name } = acquisitionMethodArrayObject[i];
      const acquisitionMethod = await AcquisitionMethod.findByPk(_id);

      if (!acquisitionMethod) {
        throw createError(`AcquisitionMethod with id ${_id} not found`, 404);
      }

      const existingNameAcquisitionMethod = await AcquisitionMethod.findOne({
        where: { name: name },
      });
      // console.log("existingNameAcquisitionMethod", existingNameAcquisitionMethod);
      // console.log("existingNameAcquisitionMethod.id", existingNameAcquisitionMethod.id);
      if (
        existingNameAcquisitionMethod &&
        existingNameAcquisitionMethod._id !== _id
      ) {
        throw createError(
          `AcquisitionMethod with name '${name}' already exists`,
          400
        );
      }

      acquisitionMethod.name = name;
      await acquisitionMethod.save();
      resAcquisitionMethod.push(acquisitionMethod);
    }

    res.json({ message: "update successfully", resAcquisitionMethod });
  } catch (err) {
    next(err);
  }
};

exports.getAllAcquisitionMethod = async (req, res, next) => {
  try {
    const acquisitionMethod = await AcquisitionMethod.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ acquisitionMethod });
  } catch (err) {
    next(err);
  }
};

exports.deleteAcquisitionMethod = async (req, res, next) => {
  try {
    const _id = req.params.acquisitionMethodId;
    let acquisitionMethod = await AcquisitionMethod.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({
      message: "delete acquisitionMethod successfully",
      acquisitionMethod,
    });
  } catch (err) {
    next(err);
  }
};
