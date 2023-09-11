const Hospital = require("../models").hospital;
const createError = require("../utils/createError");

exports.createHospital = async (req, res, next) => {
  try {
    const { hospitalArray } = req.body;
    const resHospital = [];

    for (let el of hospitalArray) {
      try {
        let hospital = await Hospital.create({
          name: el.name,
        });
        resHospital.push(hospital);
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
    res.json({ resHospital });
  } catch (err) {
    next(err);
  }
};

exports.updateHospital = async (req, res, next) => {
  try {
    const { hospitalArray } = req.body;
    const resHospital = [];

    for (let i = 0; i < hospitalArray.length; i++) {
      const { _id, name } = hospitalArray[i];
      const hospital = await Hospital.findByPk(_id);

      if (!hospital) {
        throw createError(`Hospital with id ${_id} not found`, 404);
      }

      const existingNameHospital = await Hospital.findOne({
        where: { name: name },
      });
      // console.log("existingNameHospital", existingNameHospital);
      // console.log("existingNameHospital.id", existingNameHospital.id);
      if (existingNameHospital && existingNameHospital.id !== _id) {
        throw createError(`Hospital with name '${name}' already exists`, 400);
      }

      hospital.name = name;
      await hospital.save();
      resHospital.push(hospital);
    }

    res.json({ message: "update successfully", resHospital });
  } catch (err) {
    next(err);
  }
};

exports.getAllHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ hospital });
  } catch (err) {
    next(err);
  }
};

exports.deleteHospital = async (req, res, next) => {
  try {
    const _id = req.params.hospitalId;
    let hospital = await Hospital.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ message: "delete hospital successfully", hospital });
  } catch (err) {
    next(err);
  }
};
