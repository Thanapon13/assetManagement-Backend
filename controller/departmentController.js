const Department = require("../models").department;
const createError = require("../utils/createError");

exports.createDepartment = async (req, res, next) => {
  try {
    const { departmentArray } = req.body;
    // const departmentArrayObject = departmentArray;
    const departmentArrayObject = JSON.parse(departmentArray);
    const resDepartment = [];

    // const existDepartment = await Department.find().select("name");
    // // console.log("existDepartment", existDepartment);

    // function isExist(data, exist) {
    //   for (let i = 0; i < exist.length; i++) {
    //     if (exist[i].name === data.name) {
    //       return true;
    //     }
    //   }
    //   return false;
    // }

    // departmentArrayObject.forEach((data) => {
    //   const result = isExist(data, existDepartment);
    //   if (result) {
    //     createError(`name:${data.name} is alerady exist.`, 400);
    //   }
    // });

    for (el of departmentArrayObject) {
      try {
        let department = await Department.create({
          name: el.name,
        });
        resDepartment.push(department);
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

    res.json({ resDepartment });
  } catch (err) {
    next(err);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const { departmentArray } = req.body;
    // const departmentArrayObject = departmentArray;
    const departmentArrayObject = JSON.parse(departmentArray);
    const resDepartment = [];

    for (let i = 0; i < departmentArrayObject.length; i++) {
      const { _id, name } = departmentArrayObject[i];
      const department = await Department.findByPk(_id);

      if (!department) {
        throw createError(`countingUnit with id ${_id} not found`, 404);
      }

      const existingNameDepartment = await Department.findOne({
        where: { name: name },
      });
      // console.log("existingNameType4.id", existingNameType4.id);
      if (existingNameDepartment && existingNameDepartment._id !== _id) {
        throw createError(
          `countingUnit with name '${name}' already exists`,
          400
        );
      }
      department.name = name;
      await department.save();
      resDepartment.push(department);
    }

    res.json({ message: "update successfully", resDepartment });
  } catch (err) {
    next(err);
  }
};

exports.getAllDepartment = async (req, res, next) => {
  try {
    const department = await Department.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ department });
  } catch (err) {
    next(err);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const _id = req.params.departmentId;
    let department = await Department.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ message: "delete department successfully", department });
  } catch (err) {
    next(err);
  }
};
