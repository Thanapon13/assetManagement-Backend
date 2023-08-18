const Type8 = require("../models").type8;
const createError = require("../utils/createError");

exports.createType8 = async (req, res, next) => {
  try {
    const { type8Array } = req.body;

    const resType8 = [];

    for (let el of type8Array) {
      try {
        let type8 = await Type8.create({
          name: el.name,
          value: el.value
        });
        resType8.push(type8);
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

    res.json({ message: "create successfully", resType8 });
  } catch (err) {
    next(err);
  }
};

exports.updateType8 = async (req, res, next) => {
  try {
    const { type8Array } = req.body;
    // const type8ArrayObject = type8Array
    const type8ArrayObject = JSON.parse(type8Array);
    const resType8 = [];

    for (let i = 0; i < type8ArrayObject.length; i++) {
      const { _id, name, value } = type8ArrayObject[i];
      const type8 = await Type8.findByPk(_id);

      if (!type8) {
        throw createError(`Type8 with id ${_id} not found`, 404);
      }

      const existingNameType8 = await Type8.findOne({
        where: { name: name }
      });
      // console.log("existingNameType8", existingNameType8);
      // console.log("existingNameType8.id", existingNameType8.id);
      if (existingNameType8 && existingNameType8.id !== _id) {
        throw createError(`Type8 with name '${name}' already exists`, 400);
      }

      const existingValueType8 = await Type8.findOne({
        where: { value: value }
      });
      // console.log("existingValueType8", existingValueType8);

      if (existingValueType8 && existingValueType8.id !== _id) {
        const error = new Error(`Value '${value}' already exists.`);
        error.statusCode = 400;
        throw error;
      }

      type8.name = name;
      type8.value = value;
      await type8.save();
      resType8.push(type8);
    }
    res.json({ message: "update successfully", resType8 });
  } catch (err) {
    next(err);
  }
};

exports.getAllType8 = async (req, res, next) => {
  try {
    const type8 = await Type8.findAll({
      attributes: ["_id", "name", "value"]
    });
    res.json({ type8 });
  } catch (err) {
    next(err);
  }
};

exports.deleteType8 = async (req, res, next) => {
  try {
    const _id = req.params.type8Id;
    let type8 = await Type8.destroy({
      where: {
        _id: _id
      }
    });
    res.json({ message: "delete type8 successfully", type8 });
  } catch (err) {
    next(err);
  }
};
