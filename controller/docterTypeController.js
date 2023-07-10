const DocterType = require("../models").docterType;
const createError = require("../utils/createError");

exports.createDocterType = async (req, res, next) => {
  try {
    const { docterTypeArray } = req.body;
    // const docterTypeArrayObject = docterTypeArray;
    const docterTypeArrayObject = JSON.parse(docterTypeArray);
    const resDocterType = [];

    for (let el of docterTypeArrayObject) {
      try {
        let docterType = await DocterType.create({
          name: el.name,
        });
        resDocterType.push(docterType);
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
    res.json({ resDocterType });
  } catch (err) {
    next(err);
  }
};

exports.updateDocterType = async (req, res, next) => {
  try {
    const { docterTypeArray } = req.body;
    // const docterTypeArrayObject = docterTypeArray;
    const docterTypeArrayObject = JSON.parse(docterTypeArray);
    const resDocterType = [];

    for (let i = 0; i < docterTypeArrayObject.length; i++) {
      const { _id, name } = docterTypeArrayObject[i];
      const docterType = await DocterType.findByPk(_id);

      if (!docterType) {
        throw createError(`DocterType with id ${_id} not found`, 404);
      }

      const existingNameDocterType = await DocterType.findOne({
        where: { name: name },
      });
      // console.log("existingNameDocterType", existingNameDocterType);
      // console.log("existingNameDocterType.id", existingNameDocterType.id);
      if (existingNameDocterType && existingNameDocterType.id !== _id) {
        throw createError(`DocterType with name '${name}' already exists`, 400);
      }

      docterType.name = name;
      await docterType.save();
      resDocterType.push(docterType);
    }

    res.json({ message: "update successfully", resDocterType });
  } catch (err) {
    next(err);
  }
};

exports.getAllDocterType = async (req, res, next) => {
  try {
    const docterType = await DocterType.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ docterType });
  } catch (err) {
    next(err);
  }
};

exports.deleteDocterType = async (req, res, next) => {
  try {
    const _id = req.params.docterTypeId;
    let docterType = await DocterType.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ message: "delete docterType successfully", docterType });
  } catch (err) {
    next(err);
  }
};
