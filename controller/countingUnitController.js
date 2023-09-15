const CountingUnit = require("../models").countingUnit;
const createError = require("../utils/createError");

exports.createCountingUnit = async (req, res, next) => {
  try {
    const { countingUnitArray } = req.body;
    const countingUnitArrayObject = JSON.parse(countingUnitArray);
    const resCountingUnit = [];

    for (el of countingUnitArrayObject) {
      try {
        let countingUnit = await CountingUnit.create({
          name: el.name,
        });
        resCountingUnit.push(countingUnit);
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

    res.json({ resCountingUnit });
  } catch (err) {
    next(err);
  }
};

exports.updateCountingUnit = async (req, res, next) => {
  try {
    const { countingUnitArray } = req.body;
    const countingUnitArrayObject = JSON.parse(countingUnitArray);
    const resCountingUnit = [];
    for (let i = 0; i < countingUnitArrayObject.length; i++) {
      const { _id, name } = countingUnitArrayObject[i];
      const countingUnit = await CountingUnit.findByPk(_id);

      if (!countingUnit) {
        throw createError(`countingUnit with id ${_id} not found`, 404);
      }

      const existingNameCountingUnit = await CountingUnit.findOne({
        where: { name: name },
      });
      // console.log("existingNameType4.id", existingNameType4.id);
      if (existingNameCountingUnit && existingNameCountingUnit._id !== _id) {
        throw createError(
          `countingUnit with name '${name}' already exists`,
          400
        );
      }
      countingUnit.name = name;
      await countingUnit.save();
      resCountingUnit.push(countingUnit);
    }

    res.json({ message: "update successfully", resCountingUnit });
  } catch (err) {
    next(err);
  }
};

exports.getAllCountingUnit = async (req, res, next) => {
  try {
    const countingUnit = await CountingUnit.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ countingUnit });
  } catch (err) {
    next(err);
  }
};

exports.deleteCountingUnit = async (req, res, next) => {
  try {
    const _id = req.params.countingUnitId;
    let countingUnit = await CountingUnit.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ message: "delete countingUnit successfully", countingUnit });
  } catch (err) {
    next(err);
  }
};
