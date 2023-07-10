const Category = require("../models").category;
const createError = require("../utils/createError");

exports.createCategory = async (req, res, next) => {
  try {
    const { categoryArray } = req.body;
    // const categoryArrayObject = categoryArray
    const categoryArrayObject = JSON.parse(categoryArray);
    const resCategory = [];

    for (let el of categoryArrayObject) {
      try {
        let category = await Category.create({
          name: el.name,
          value: el.value,
        });
        resCategory.push(category);
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

    res.json({ message: "create successfully", resCategory });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { categoryArray } = req.body;
    // const categoryArrayObject = categoryArray
    const categoryArrayObject = JSON.parse(categoryArray);
    const resCategory = [];

    for (let i = 0; i < categoryArrayObject.length; i++) {
      const { _id, name, value } = categoryArrayObject[i];
      const category = await Category.findByPk(_id);

      if (!category) {
        throw createError(`Category with id ${_id} not found`, 404);
      }

      const existingNameCategory = await Category.findOne({
        where: { name: name },
      });
      // console.log("existingNameCategory", existingNameCategory);
      // console.log("existingNameCategory.id", existingNameCategory.id);
      if (existingNameCategory && existingNameCategory.id !== _id) {
        throw createError(`Category with name '${name}' already exists`, 400);
      }

      const existingValueCategory = await Category.findOne({
        where: { value: value },
      });
      // console.log("existingValueCategory", existingValueCategory);

      if (existingValueCategory && existingValueCategory.id !== _id) {
        const error = new Error(`Value '${value}' already exists.`);
        error.statusCode = 400;
        throw error;
      }

      category.name = name;
      category.value = value;
      await category.save();
      resCategory.push(category);
    }

    res.json({ message: "update successfully", resCategory });
  } catch (err) {
    next(err);
  }
};

exports.getAllCategory = async (req, res, next) => {
  try {
    const category = await Category.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ category });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { _id } = req.body;
    let category = await Category.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ category });
  } catch (err) {
    next(err);
  }
};
