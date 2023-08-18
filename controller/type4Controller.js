const Type4 = require("../models").type4;
const createError = require("../utils/createError");

exports.createType4 = async (req, res, next) => {
  try {
    const { type4Array } = req.body;

    const resType4 = [];

    for (let el of type4Array) {
      try {
        let type4 = await Type4.create({
          name: el.name,
          value: el.value
        });
        resType4.push(type4);
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

    res.json({ message: "create successfully", resType4 });
  } catch (err) {
    next(err);
  }
};

exports.updateType4 = async (req, res, next) => {
  try {
    const { type4Array } = req.body;
    // const type4ArrayObject = type4Array
    const type4ArrayObject = JSON.parse(type4Array);
    const resType4 = [];

    for (let i = 0; i < type4ArrayObject.length; i++) {
      const { _id, name, value } = type4ArrayObject[i];
      const type4 = await Type4.findByPk(_id);

      if (!type4) {
        throw createError(`Type4 with id ${_id} not found`, 404);
      }

      const existingNameType4 = await Type4.findOne({
        where: { name: name }
      });
      console.log("existingNameType4", existingNameType4);
      // console.log("existingNameType4.id", existingNameType4.id);
      if (existingNameType4 && existingNameType4.id !== _id) {
        throw createError(`Type4 with name '${name}' already exists`, 400);
      }

      const existingValueType4 = await Type4.findOne({
        where: { value: value }
      });
      // console.log("existingValueType4", existingValueType4);

      if (existingValueType4 && existingValueType4.id !== _id) {
        const error = new Error(`Value '${value}' already exists.`);
        error.statusCode = 400;
        throw error;
      }

      type4.name = name;
      type4.value = value;
      await type4.save();
      resType4.push(type4);
    }

    res.json({ message: "update successfully", resType4 });
  } catch (err) {
    next(err);
  }
};

exports.getAllType4 = async (req, res, next) => {
  try {
    const type4 = await Type4.findAll({
      attributes: ["_id", "name", "value"]
    });
    res.json({ type4 });
  } catch (err) {
    next(err);
  }
};

exports.deleteType4 = async (req, res, next) => {
  try {
    const _id = req.params.type4Id;
    let type4 = await Type4.destroy({
      where: {
        _id: _id
      }
    });

    res.json({ message: "delete type4 successfully", type4 });
  } catch (err) {
    next(err);
  }
};
