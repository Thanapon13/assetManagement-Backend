const { role, accessScreen } = require("../models");
const { Op } = require("sequelize");

exports.getAllRole = async (req, res, next) => {
  try {
    const roles = await role.findAll({
      where: {
        deletedAt: null
      },
      include: [{ model: accessScreen, as: "roleAccessScreen" }]
    });

    res.status(200).json({ roles });
  } catch (err) {
    next(err);
  }
};

exports.getRoleById = async (req, res, next) => {
  try {
    const roleId = req.params.roleId;
    console.log("roleId:", roleId);

    const roles = await role.findOne({
      where: { _id: roleId },
      include: [{ model: accessScreen, as: "roleAccessScreen" }]
    });

    res.status(200).json({ roles });
  } catch (err) {
    next(err);
  }
};

exports.createRole = async (req, res, next) => {
  try {
    const { name, screen } = req.body;

    console.log("name:", name);
    console.log("screen:", screen);

    const createRoleData = await role.create({
      roleName: name
    });

    const roleId = createRoleData.dataValues._id;
    console.log("roleId:", roleId);

    const createdAccessScreens = [];
    for (let i = 0; i < screen.length; i++) {
      const screenData = screen[i];
      console.log("screenData:", screenData);

      const newAccessScreen = await accessScreen.create({
        name: screenData.name,
        order: screenData.order,
        roleId: roleId
      });
      createdAccessScreens.push(newAccessScreen);
    }

    res
      .status(200)
      .json({ role: createRoleData, accessScreen: createdAccessScreens });
  } catch (err) {
    next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const roleId = req.params.roleId;
    const { name, screen } = req.body;

    console.log("name:", name);
    console.log("screen:", screen);
    console.log("roleId:", roleId);

    const roleDataId = await role.findOne({ where: { _id: roleId } });
    // console.log("roleDataId:", roleDataId);

    if (!roleDataId) {
      return res.status(404).json({ message: "Role not found" });
    }

    roleDataId.roleName = name;
    await roleDataId.save();

    for (let i = 0; i < screen.length; i++) {
      const screenData = screen[i];
      console.log("screenData:", screenData);

      const accessScreenData = await accessScreen.findOne({
        where: { name: screenData.name, roleId: roleId }
      });

      console.log("accessScreenData:", accessScreenData);

      if (accessScreenData) {
        await accessScreen.update(
          {
            order: screenData.order
          },
          {
            where: { _id: accessScreenData._id }
          }
        );
      } else {
        await accessScreen.create({
          name: screenData.name,
          order: screenData.order,
          roleId: roleId
        });
      }
    }

    res.status(200).json({ message: "update role successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deleteRole = async (req, res, next) => {
  try {
    const roleId = req.params.roleId;
    console.log("roleId:", roleId);

    const roleData = await role.update(
      { deletedAt: new Date() },
      { where: { _id: roleId } }
    );
    console.log("roleData:", roleData);
    res.status(200).json({ message: "delete successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getBySearch = async (req, res, next) => {
  try {
    const typeTextSearch = req.query.typeTextSearch || "";
    const textSearch = req.query.textSearch || "";
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;

    let whereClause = {};

    // for 2 field search
    if (textSearch !== "") {
      whereClause[typeTextSearch] = {
        [Op.like]: `%${textSearch}%`
      };
    }

    whereClause["deletedAt"] = null;

    console.log(whereClause, "query");

    const roles = await role.findAll({
      where: whereClause,
      order: [["updatedAt", "DESC"]],
      offset: page * limit,
      limit: limit
    });

    const total = await role.count({
      where: whereClause
    });

    res.json({ roles, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};
