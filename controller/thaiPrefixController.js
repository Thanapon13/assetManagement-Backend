const ThaiPrefix = require("../models").thaiPrefix;
const createError = require("../utils/createError");

exports.createThaiPrefix = async (req, res, next) => {
  try {
    const { thaiPrefixArray } = req.body;
    // const thaiPrefixArrayObject = thaiPrefixArray;
    const thaiPrefixArrayObject = JSON.parse(thaiPrefixArray);
    const resThaiPrefix = [];

    for (let el of thaiPrefixArrayObject) {
      try {
        let thaiPrefix = await ThaiPrefix.create({
          name: el.name,
        });
        resThaiPrefix.push(thaiPrefix);
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
    res.json({ resThaiPrefix });
  } catch (err) {
    next(err);
  }
};

exports.updateThaiPrefix = async (req, res, next) => {
  try {
    const { thaiPrefixArray } = req.body;
    // const thaiPrefixArrayObject = thaiPrefixArray;
    const thaiPrefixArrayObject = JSON.parse(thaiPrefixArray);
    const resThaiPrefix = [];

    for (let i = 0; i < thaiPrefixArrayObject.length; i++) {
      const { _id, name } = thaiPrefixArrayObject[i];
      const thaiPrefix = await ThaiPrefix.findByPk(_id);

      if (!thaiPrefix) {
        throw createError(`ThaiPrefix with id ${_id} not found`, 404);
      }

      const existingNameThaiPrefix = await ThaiPrefix.findOne({
        where: { name: name },
      });
      // console.log("existingNameThaiPrefix", existingNameThaiPrefix);
      // console.log("existingNameThaiPrefix.id", existingNameThaiPrefix.id);
      if (existingNameThaiPrefix && existingNameThaiPrefix.id !== _id) {
        throw createError(`ThaiPrefix with name '${name}' already exists`, 400);
      }

      thaiPrefix.name = name;
      await thaiPrefix.save();
      resThaiPrefix.push(thaiPrefix);
    }

    res.json({ message: "update successfully", resThaiPrefix });
  } catch (err) {
    next(err);
  }
};

exports.getAllThaiPrefix = async (req, res, next) => {
  try {
    const thaiPrefix = await ThaiPrefix.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ thaiPrefix });
  } catch (err) {
    next(err);
  }
};

exports.deleteThaiPrefix = async (req, res, next) => {
  try {
    const _id = req.params.thaiPrefixId;
    let thaiPrefix = await ThaiPrefix.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ message: "delete thaiPrefix successfully", thaiPrefix });
  } catch (err) {
    next(err);
  }
};
