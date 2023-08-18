const Kind = require("../models").kind;
const createError = require("../utils/createError");

exports.createKind = async (req, res, next) => {
  try {
    const { kindArray } = req.body;
    // const kindArrayObject = kindArray
    console.log("kindArray:", kindArray);

    const resKind = [];

    for (let el of kindArray) {
      try {
        let kind = await Kind.create({
          name: el.name,
          value: el.value
        });
        resKind.push(kind);
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

    res.json({ message: "create successfully", resKind });
  } catch (err) {
    next(err);
  }
};

exports.updateKind = async (req, res, next) => {
  try {
    const { kindArray } = req.body;
    // const kindArrayObject = kindArray
    const kindArrayObject = JSON.parse(kindArray);
    const resKind = [];

    for (let i = 0; i < kindArrayObject.length; i++) {
      const { _id, name, value } = kindArrayObject[i];
      const kind = await Kind.findByPk(_id);

      if (!kind) {
        throw createError(`Kind with id ${_id} not found`, 404);
      }

      const existingNameKind = await Kind.findOne({
        where: { name: name }
      });
      // console.log("existingNameKind", existingNameKind);
      // console.log("existingNameKind.id", existingNameKind.id);
      if (existingNameKind && existingNameKind.id !== _id) {
        throw createError(`Kind with name '${name}' already exists`, 400);
      }

      const existingValueKind = await Kind.findOne({
        where: { value: value }
      });
      // console.log("existingValueKind", existingValueKind);

      if (existingValueKind && existingValueKind.id !== _id) {
        const error = new Error(`Value '${value}' already exists.`);
        error.statusCode = 400;
        throw error;
      }

      kind.name = name;
      kind.value = value;
      await kind.save();
      resKind.push(kind);
    }

    res.json({ message: "update successfully", resKind });
  } catch (err) {
    next(err);
  }
};

exports.getAllKind = async (req, res, next) => {
  try {
    const kind = await Kind.findAll({
      attributes: ["_id", "name", "value"]
    });
    res.json({ kind });
  } catch (err) {
    next(err);
  }
};

exports.deleteKind = async (req, res, next) => {
  try {
    const _id = req.params.kindId;
    let kind = await Kind.destroy({
      where: {
        _id: _id
      }
    });
    res.json({ kind });
  } catch (err) {
    next(err);
  }
};
