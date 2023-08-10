const Type = require("../models").type;
const createError = require("../utils/createError");

exports.createType = async (req, res, next) => {
  try {
    const { typeArray } = req.body;
    // const typeArrayObject = typeArray;
    const resType = [];

    for (let el of typeArray) {
      try {
        let type = await Type.create({
          name: el.name,
          value: el.value,
        });
        resType.push(type);
      } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
          // handle unique constraint error
          return next(
            createError(
              `name:${el.name} or value:${el.value} is already exist.`,
              400
            )
          );
        } else {
          // handle other errors
          return next(err);
        }
      }
    }

    res.json({ message: "create successfully", resType });
  } catch (err) {
    next(err);
  }
};

exports.updateType = async (req, res, next) => {
  try {
    const { typeArray } = req.body;
    // const typeArrayObject = typeArray;
    const resType = [];

    for (let i = 0; i < typeArray.length; i++) {
      const { _id, name, value } = typeArray[i];
      const type = await Type.findByPk(_id);

      if (!type) {
        throw createError(`Type with id ${_id} not found`, 404);
      }

      const existingNameType = await Type.findOne({
        where: { name: name },
      });
      // console.log("existingNameType", existingNameType);
      // console.log("existingNameType.id", existingNameType.id);
      if (existingNameType && existingNameType.id !== _id) {
        throw createError(`Type with name '${name}' already exists`, 400);
      }

      const existingValueType = await Type.findOne({
        where: { value: value },
      });
      // console.log("existingValueType", existingValueType);

      if (existingValueType && existingValueType.id !== _id) {
        const error = new Error(`Value '${value}' already exists.`);
        error.statusCode = 400;
        throw error;
      }

      type.name = name;
      type.value = value;
      await type.save();
      resType.push(type);
    }

    res.json({ message: "update successfully", resType });
  } catch (err) {
    next(err);
  }
};

exports.getAllType = async (req, res, next) => {
  try {
    const type = await Type.findAll({
      attributes: ["_id", "name", "value"],
    });
    res.json({ type });
  } catch (err) {
    next(err);
  }
};

exports.deleteType = async (req, res, next) => {
  try {
    const _id = req.params.typeId;
    let type = await Type.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ message: "delete type successfully", type });
  } catch (err) {
    next(err);
  }
};
