const SubSector = require("../models").subSecter;
const createError = require("../utils/createError");

exports.createSubSector = async (req, res, next) => {
  try {
    const { subSectorArray } = req.body;
    const resSubSector = [];

    for (let el of subSectorArray) {
      try {
        let subSector = await SubSector.create({
          name: el.name
        });
        resSubSector.push(subSector);
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

    res.json({ resSubSector });
  } catch (err) {
    next(err);
  }
};

exports.updateSubSector = async (req, res, next) => {
  try {
    const { subSectorArray } = req.body;
    // const subSectorArrayObject = subSectorArray;
    const subSectorArrayObject = JSON.parse(subSectorArray);
    const resSubSector = [];

    for (let i = 0; i < subSectorArrayObject.length; i++) {
      const { _id, name } = subSectorArrayObject[i];
      const subSector = await SubSector.findByPk(_id);

      if (!subSector) {
        throw createError(`SubSector with id ${_id} not found`, 404);
      }

      const existingNameSubSector = await SubSector.findOne({
        where: { name: name }
      });
      // console.log("existingNameSubSector", existingNameSubSector);
      // console.log("existingNameSubSector.id", existingNameSubSector.id);
      if (existingNameSubSector && existingNameSubSector.id !== _id) {
        throw createError(`SubSector with name '${name}' already exists`, 400);
      }

      subSector.name = name;
      await subSector.save();
      resSubSector.push(subSector);
    }

    res.json({ message: "update successfully", resSubSector });
  } catch (err) {
    next(err);
  }
};

exports.getAllSubSector = async (req, res, next) => {
  try {
    const subSector = await SubSector.findAll({
      attributes: ["_id", "name"]
    });
    res.json({ subSector });
  } catch (err) {
    next(err);
  }
};

exports.deleteSubSector = async (req, res, next) => {
  try {
    const _id = req.params.subSectorId;
    let subSector = await SubSector.destroy({
      where: {
        _id: _id
      }
    });

    res.json({ message: "delete subSector successfully", subSector });
  } catch (err) {
    next(err);
  }
};
