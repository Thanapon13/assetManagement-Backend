const Group = require("../models").group;
const createError = require("../utils/createError");

exports.createGroup = async (req, res, next) => {
  try {
    const { groupArray } = req.body;
    const groupArrayObject = JSON.parse(groupArray);

    const resGroup = [];

    for (let el of groupArrayObject) {
      try {
        let group = await Group.create({
          name: el.name,
        });
        resGroup.push(group);
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

    res.json({ resGroup });
  } catch (err) {
    next(err);
  }
};

exports.updateGroup = async (req, res, next) => {
  try {
    const { groupArray } = req.body;
    // const groupArrayObject = groupArray;
    const groupArrayObject = JSON.parse(groupArray);
    const resGroup = [];

    for (let i = 0; i < groupArrayObject.length; i++) {
      const { _id, name } = groupArrayObject[i];
      const group = await Group.findByPk(_id);

      if (!group) {
        throw createError(`Group with id ${_id} not found`, 404);
      }

      const existingNameGroup = await Group.findOne({
        where: { name: name },
      });
      // console.log("existingNameGroup", existingNameGroup);
      // console.log("existingNameGroup.id", existingNameGroup.id);
      if (existingNameGroup && existingNameGroup._id !== _id) {
        throw createError(`Group with name '${name}' already exists`, 400);
      }

      group.name = name;
      await group.save();
      resGroup.push(group);
    }

    res.json({ resGroup });
  } catch (err) {
    next(err);
  }
};

exports.getAllGroup = async (req, res, next) => {
  try {
    const group = await Group.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ group });
  } catch (err) {
    next(err);
  }
};

exports.deleteGroup = async (req, res, next) => {
  try {
    const _id = req.params.groupId;
    let group = await Group.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ message: "delete group successfully", group });
  } catch (err) {
    next(err);
  }
};
