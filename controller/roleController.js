const { role } = require("../models");

exports.createRole = async (req, res, next) => {
  try {
    const { name, screen } = req.body;
    console.log("name:", name);
    console.log("screen:", screen);

    const createRole = await role.create({
      roleName: name,
      accessScreen: screen
    });
    res.status(200).json({ createRole });
  } catch (err) {
    next(err);
  }
};
