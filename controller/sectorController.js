const Sector = require("../models").sector;
const createError = require("../utils/createError");

exports.createSector = async (req, res, next) => {
  try {
    const { sectorArray } = req.body;
    // const sectorArrayObject = sectorArray;
    const sectorArrayObject = JSON.parse(sectorArray);
    const resSector = [];

    for (let el of sectorArrayObject) {
      try {
        let sector = await Sector.create({
          name: el.name,
        });
        resSector.push(sector);
      } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
          // handle unique constraint error
          return next(createError(`name:${el.name}  is already exist.`, 400));
        } else {
          // handle other errors
          return next(err);
        }
      }
    }

    res.json({ resSector });
  } catch (err) {
    next(err);
  }
};

exports.updateSector = async (req, res, next) => {
  try {
    const { sectorArray } = req.body;
    // const sectorArrayObject = sectorArray;
    const sectorArrayObject = JSON.parse(sectorArray);
    const resSector = [];

    for (let i = 0; i < sectorArrayObject.length; i++) {
      const { _id, name } = sectorArrayObject[i];
      const sector = await Sector.findByPk(_id);

      if (!sector) {
        throw createError(`Sector with id ${_id} not found`, 404);
      }

      const existingNameSector = await Sector.findOne({
        where: { name: name },
      });
      // console.log("existingNameSector", existingNameSector);
      // console.log("existingNameSector.id", existingNameSector.id);
      if (existingNameSector && existingNameSector.id !== _id) {
        throw createError(`Sector with name '${name}' already exists`, 400);
      }

      sector.name = name;
      await sector.save();
      resSector.push(sector);
    }

    res.json({ resSector });
  } catch (err) {
    next(err);
  }
};

exports.getAllSector = async (req, res, next) => {
  try {
    const sector = await Sector.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ sector });
  } catch (err) {
    next(err);
  }
};

exports.deleteSector = async (req, res, next) => {
  try {
    const _id = req.params.sectorId;
    let sector = await Sector.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ message: "delete sector successfully", sector });
  } catch (err) {
    next(err);
  }
};
