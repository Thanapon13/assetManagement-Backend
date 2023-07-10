const EngPrefix = require("../models").engPrefix;
const createError = require("../utils/createError");

exports.createEngPrefix = async (req, res, next) => {
  try {
    const { engPrefixArray } = req.body;
    // const engPrefixArrayObject = engPrefixArray;
    const engPrefixArrayObject = JSON.parse(engPrefixArray);
    const resEngPrefix = [];

    for (let el of engPrefixArrayObject) {
      try {
        let engPrefix = await EngPrefix.create({
          name: el.name,
        });
        resEngPrefix.push(engPrefix);
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
    res.json({ resEngPrefix });
  } catch (err) {
    next(err);
  }
};

exports.updateEngPrefix = async (req, res, next) => {
  try {
    const { engPrefixArray } = req.body;
    // const engPrefixArrayObject = engPrefixArray;
    const engPrefixArrayObject = JSON.parse(engPrefixArray);
    const resEngPrefix = [];

    for (let i = 0; i < engPrefixArrayObject.length; i++) {
      const { _id, name } = engPrefixArrayObject[i];
      const engPrefix = await EngPrefix.findByPk(_id);

      if (!engPrefix) {
        throw createError(`EngPrefix with id ${_id} not found`, 404);
      }

      const existingNameEngPrefix = await EngPrefix.findOne({
        where: { name: name },
      });
      // console.log("existingNameEngPrefix", existingNameEngPrefix);
      // console.log("existingNameEngPrefix.id", existingNameEngPrefix.id);
      if (existingNameEngPrefix && existingNameEngPrefix.id !== _id) {
        throw createError(`EngPrefix with name '${name}' already exists`, 400);
      }

      engPrefix.name = name;
      await engPrefix.save();
      resEngPrefix.push(engPrefix);
    }

    res.json({ message: "update successfully", resEngPrefix });
  } catch (err) {
    next(err);
  }
};

exports.getAllEngPrefix = async (req, res, next) => {
  try {
    const engPrefix = await EngPrefix.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ engPrefix });
  } catch (err) {
    next(err);
  }
};

exports.deleteEngPrefix = async (req, res, next) => {
  try {
    const _id = req.params.engPrefixId;
    let engPrefix = await EngPrefix.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ message: "delete engPrefix successfully", engPrefix });
  } catch (err) {
    next(err);
  }
};
