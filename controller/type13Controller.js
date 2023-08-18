const Type13 = require("../models").type13;
const createError = require("../utils/createError");

exports.createType13 = async (req, res, next) => {
  try {
    const { type13Array } = req.body;
    const resType13 = [];

    for (el of type13Array) {
      try {
        let type13 = await Type13.create({
          name: el.name,
          value: el.value
        });
        resType13.push(type13);
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

    res.json({ message: "create successfully", resType13 });
  } catch (err) {
    next(err);
  }
};

exports.updateType13 = async (req, res, next) => {
  try {
    const { type13Array } = req.body;
    // const type13ArrayObject = type13Array
    const type13ArrayObject = JSON.parse(type13Array);
    const resType13 = [];

    for (let i = 0; i < type13ArrayObject.length; i++) {
      const { _id, name, value } = type13ArrayObject[i];
      const type13 = await Type13.findByPk(_id);

      if (!type13) {
        throw createError(`Type13 with id ${_id} not found`, 404);
      }

      const existingNameType13 = await Type13.findOne({
        where: { name: name }
      });
      console.log("existingNameType13", existingNameType13);
      // console.log("existingNameType13.id", existingNameType13.id);
      if (existingNameType13 && existingNameType13.id !== _id) {
        throw createError(`Type13 with name '${name}' already exists`, 400);
      }

      const existingValueType13 = await Type13.findOne({
        where: { value: value }
      });
      // console.log("existingValueType13", existingValueType13);

      if (existingValueType13 && existingValueType13.id !== _id) {
        const error = new Error(`Value '${value}' already exists.`);
        error.statusCode = 400;
        throw error;
      }

      type13.name = name;
      type13.value = value;
      await type13.save();
      resType13.push(type13);
    }
    res.json({ message: "update successfully", resType13 });
  } catch (err) {
    next(err);
  }
};

exports.getAllType13 = async (req, res, next) => {
  try {
    const type13 = await Type13.findAll({
      attributes: ["_id", "name", "value"]
    });
    res.json({ type13 });
  } catch (err) {
    next(err);
  }
};

exports.deleteType13 = async (req, res, next) => {
  try {
    const _id = req.params.type13Id;
    let type13 = await Type13.destroy({
      where: {
        _id: _id
      }
    });

    res.json({ message: "delete type13 successfully", type13 });
  } catch (err) {
    next(err);
  }
};
