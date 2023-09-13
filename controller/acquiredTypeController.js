const AcquiredType = require("../models").acquiredType;
const createError = require("../utils/createError");

exports.createAcquiredType = async (req, res, next) => {
  try {
    const { acquiredTypeArray } = req.body;
    const acquiredTypeArrayObject = JSON.parse(acquiredTypeArray);

    const resAcquiredType = [];

    for (let el of acquiredTypeArrayObject) {
      try {
        let acquiredType = await AcquiredType.create({
          name: el.name
        });

        resAcquiredType.push(acquiredType);
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
    res.json({ resAcquiredType });
  } catch (err) {
    next(err);
  }
};

exports.updateAcquiredType = async (req, res, next) => {
  try {
    const { acquiredTypeArray } = req.body;
    // const acquiredTypeArrayObject = acquiredTypeArray;
    const acquiredTypeArrayObject = JSON.parse(acquiredTypeArray);
    const resAcquiredType = [];

    for (let i = 0; i < acquiredTypeArrayObject.length; i++) {
      const { _id, name } = acquiredTypeArrayObject[i];
      const acquiredType = await AcquiredType.findByPk(_id);
      if (!acquiredType) {
        throw createError(`AcquiredType with id ${_id} not found`, 404);
      }

      const existingNameAcquiredType = await AcquiredType.findOne({
        where: { name: name }
      });
      // console.log("existingNameAcquiredType", existingNameAcquiredType);
      // console.log("existingNameAcquiredType.id", existingNameAcquiredType.id);
      if (existingNameAcquiredType && existingNameAcquiredType.id !== _id) {
        throw createError(
          `AcquiredType with name '${name}' already exists`,
          400
        );
      }

      acquiredType.name = name;
      await acquiredType.save();
      resAcquiredType.push(acquiredType);
    }

    res.json({ message: "update successfully", resAcquiredType });
  } catch (err) {
    next(err);
  }
};

exports.getAllAcquiredType = async (req, res, next) => {
  try {
    const acquiredType = await AcquiredType.findAll({
      attributes: ["_id", "name"]
    });
    res.json({ acquiredType });
  } catch (err) {
    next(err);
  }
};

exports.deleteAcquiredType = async (req, res, next) => {
  try {
    const _id = req.params.acquiredTypeId;
    let acquiredType = await AcquiredType.destroy({
      where: {
        _id: _id
      }
    });

    res.json({ message: "delete acquiredType successfully", acquiredType });
  } catch (err) {
    next(err);
  }
};
