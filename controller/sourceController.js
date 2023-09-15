const Source = require("../models").source;
const createError = require("../utils/createError");

exports.createSource = async (req, res, next) => {
  try {
    const { sourceArray } = req.body;
    const sourceArrayObject = JSON.parse(sourceArray);
    const resSource = [];

    for (let el of sourceArrayObject) {
      try {
        let source = await Source.create({
          name: el.name,
        });
        resSource.push(source);
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

    res.json({ resSource });
  } catch (err) {
    next(err);
  }
};

exports.updateSource = async (req, res, next) => {
  try {
    const { sourceArray } = req.body;
    // const sourceArrayObject = sourceArray;
    const sourceArrayObject = JSON.parse(sourceArray);
    const resSource = [];

    for (let i = 0; i < sourceArrayObject.length; i++) {
      const { _id, name } = sourceArrayObject[i];
      const source = await Source.findByPk(_id);

      if (!source) {
        throw createError(`Source with id ${_id} not found`, 404);
      }

      const existingNameSource = await Source.findOne({
        where: { name: name },
      });
      // console.log("existingNameSource", existingNameSource);
      // console.log("existingNameSource.id", existingNameSource.id);
      if (existingNameSource && existingNameSource._id !== _id) {
        throw createError(`Source with name '${name}' already exists`, 400);
      }

      source.name = name;
      await source.save();
      resSource.push(source);
    }

    res.json({ message: "update successfully", resSource });
  } catch (err) {
    next(err);
  }
};

exports.getAllSource = async (req, res, next) => {
  try {
    const source = await Source.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ source });
  } catch (err) {
    next(err);
  }
};

exports.deleteSource = async (req, res, next) => {
  try {
    const _id = req.params.sourceId;
    let source = await Source.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ message: "delete source successfully", source });
  } catch (err) {
    next(err);
  }
};
