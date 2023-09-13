const MoneyType = require("../models").moneyType;
const createError = require("../utils/createError");

exports.createMoneyType = async (req, res, next) => {
  try {
    const { moneyTypeArray } = req.body;
    const moneyTypeArrayObject = JSON.parse(moneyTypeArray);

    const resMoneyType = [];

    for (let el of moneyTypeArrayObject) {
      try {
        let moneyType = await MoneyType.create({
          name: el.name,
        });
        resMoneyType.push(moneyType);
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

    res.json({ resMoneyType });
  } catch (err) {
    next(err);
  }
};

exports.updateMoneyType = async (req, res, next) => {
  try {
    const { moneyTypeArray } = req.body;
    // const moneyTypeArrayObject = moneyTypeArray;
    const moneyTypeArrayObject = JSON.parse(moneyTypeArray);
    const resMoneyType = [];

    for (let i = 0; i < moneyTypeArrayObject.length; i++) {
      const { _id, name } = moneyTypeArrayObject[i];
      const moneyType = await MoneyType.findByPk(_id);

      if (!moneyType) {
        throw createError(`MoneyType with id ${_id} not found`, 404);
      }

      const existingNameMoneyType = await MoneyType.findOne({
        where: { name: name },
      });
      // console.log("existingNameMoneyType", existingNameMoneyType);
      // console.log("existingNameMoneyType.id", existingNameMoneyType.id);
      if (existingNameMoneyType && existingNameMoneyType._id !== _id) {
        throw createError(`MoneyType with name '${name}' already exists`, 400);
      }

      moneyType.name = name;
      await moneyType.save();
      resMoneyType.push(moneyType);
    }

    res.json({ message: "update successfully", resMoneyType });
  } catch (err) {
    next(err);
  }
};

exports.getAllMoneyType = async (req, res, next) => {
  try {
    const moneyType = await MoneyType.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ moneyType });
  } catch (err) {
    next(err);
  }
};

exports.deleteMoneyType = async (req, res, next) => {
  try {
    const _id = req.params.moneyTypeId;
    let moneyType = await MoneyType.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ message: "delete moneyType successfully", moneyType });
  } catch (err) {
    next(err);
  }
};
