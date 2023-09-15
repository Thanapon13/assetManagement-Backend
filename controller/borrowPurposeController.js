const BorrowPurpose = require("../models").borrowPurpose;
const createError = require("../utils/createError");

exports.createBorrowPurpose = async (req, res, next) => {
  try {
    const { borrowPurposeArray } = req.body;
    // const borrowPurposeArrayObject = borrowPurposeArray;
    const borrowPurposeArrayObject = JSON.parse(borrowPurposeArray);
    const resBorrowPurpose = [];

    for (let el of borrowPurposeArrayObject) {
      try {
        let borrowPurpose = await BorrowPurpose.create({
          name: el.name,
        });
        resBorrowPurpose.push(borrowPurpose);
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
    res.json({ resBorrowPurpose });
  } catch (err) {
    next(err);
  }
};

exports.updateBorrowPurpose = async (req, res, next) => {
  try {
    const { borrowPurposeArray } = req.body;
    // const borrowPurposeArrayObject = borrowPurposeArray;
    const borrowPurposeArrayObject = JSON.parse(borrowPurposeArray);
    const resBorrowPurpose = [];

    for (let i = 0; i < borrowPurposeArrayObject.length; i++) {
      const { _id, name } = borrowPurposeArrayObject[i];
      const borrowPurpose = await BorrowPurpose.findByPk(_id);

      if (!borrowPurpose) {
        throw createError(`BorrowPurpose with id ${_id} not found`, 404);
      }

      const existingNameBorrowPurpose = await BorrowPurpose.findOne({
        where: { name: name },
      });
      // console.log("existingNameBorrowPurpose", existingNameBorrowPurpose);
      // console.log("existingNameBorrowPurpose.id", existingNameBorrowPurpose.id);
      if (existingNameBorrowPurpose && existingNameBorrowPurpose._id !== _id) {
        throw createError(
          `BorrowPurpose with name '${name}' already exists`,
          400
        );
      }

      borrowPurpose.name = name;
      await borrowPurpose.save();
      resBorrowPurpose.push(borrowPurpose);
    }

    res.json({ message: "update successfully", resBorrowPurpose });
  } catch (err) {
    next(err);
  }
};

exports.getAllBorrowPurpose = async (req, res, next) => {
  try {
    const borrowPurpose = await BorrowPurpose.findAll({
      attributes: ["_id", "name"],
    });
    res.json({ borrowPurpose });
  } catch (err) {
    next(err);
  }
};

exports.deleteBorrowPurpose = async (req, res, next) => {
  try {
    const _id = req.params.borrowPurposeId;
    let borrowPurpose = await BorrowPurpose.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ message: "delete borrowPurpose successfully", borrowPurpose });
  } catch (err) {
    next(err);
  }
};
