const RepairSector = require("../models").repairSector;

exports.createRepairSector = async (req, res, next) => {
  try {
    const { repairSectorArray } = req.body;
    const resRepairSector = [];

    for (el of repairSectorArray) {
      try {
        let repairSector = await RepairSector.create({
          name: el.name,
        });
        resRepairSector.push(repairSector);
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

    res.json({ message: "create successfully", resRepairSector });
  } catch (err) {
    next(err);
  }
};

exports.updateRepairSector = async (req, res, next) => {
  try {
    const { repairSectorArray } = req.body;
    const repairSectorArrayObject = JSON.parse(repairSectorArray);

    const resRepairSector = [];

    for (let i = 0; i < repairSectorArrayObject.length; i++) {
      const { _id, name } = repairSectorArrayObject[i];
      const repairSector = await RepairSector.findByPk(_id);

      if (!repairSector) {
        throw createError(`countingUnit with id ${_id} not found`, 404);
      }

      const existingNameRepairSector = await RepairSector.findOne({
        where: { name: name },
      });
      // console.log("existingNameType4.id", existingNameType4.id);
      if (existingNameRepairSector && existingNameRepairSector.id !== _id) {
        throw createError(
          `countingUnit with name '${name}' already exists`,
          400
        );
      }
      repairSector.name = name;
      await repairSector.save();
      resRepairSector.push(repairSector);
    }

    res.json({ resRepairSector });
  } catch (err) {
    next(err);
  }
};

exports.getAllRepairSector = async (req, res, next) => {
  try {
    const repairSector = await RepairSector.findAll({
      attributes: ["id", "name"],
    });
    res.json({ repairSector });
  } catch (err) {
    next(err);
  }
};

exports.deleteRepairSector = async (req, res, next) => {
  try {
    const { id } = req.body;
    let repairSector = await RepairSector.destroy({
      where: {
        _id: id,
      },
    });

    res.json({ repairSector });
  } catch (err) {
    next(err);
  }
};
