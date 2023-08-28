const CompanyPrefix = require("../models").companyPrefix;
const createError = require("../utils/createError");

exports.createCompanyPrefix = async (req, res, next) => {
  try {
    const { companyPrefixArray } = req.body;
    // const companyPrefixArrayObject = companyPrefixArray;
    const resCompanyPrefix = [];

    for (let el of companyPrefixArray) {
      try {
        let companyPrefix = await CompanyPrefix.create({
          name: el.name,
        });
        resCompanyPrefix.push(companyPrefix);
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
    res.json({ resCompanyPrefix });
  } catch (err) {
    next(err);
  }
};

exports.updateCompanyPrefix = async (req, res, next) => {
  try {
    const { companyPrefixArray } = req.body;
    const resCompanyPrefix = [];

    for (let i = 0; i < companyPrefixArray.length; i++) {
      const { _id, name } = companyPrefixArray[i];
      const companyPrefix = await CompanyPrefix.findByPk(_id);

      if (!companyPrefix) {
        throw createError(`CompanyPrefix with id ${_id} not found`, 404);
      }

      const existingNameCompanyPrefix = await CompanyPrefix.findOne({
        where: { name: name },
      });
      // console.log("existingNameCompanyPrefix", existingNameCompanyPrefix);
      // console.log("existingNameCompanyPrefix.id", existingNameCompanyPrefix.id);
      if (existingNameCompanyPrefix && existingNameCompanyPrefix.id !== _id) {
        throw createError(
          `CompanyPrefix with name '${name}' already exists`,
          400
        );
      }

      companyPrefix.name = name;
      await companyPrefix.save();
      resCompanyPrefix.push(companyPrefix);
    }

    res.json({ message: "update successfully", resCompanyPrefix });
  } catch (err) {
    next(err);
  }
};

exports.getAllCompanyPrefix = async (req, res, next) => {
  try {
    const companyPrefix = await CompanyPrefix.findAll();
    res.json({ companyPrefix });
  } catch (err) {
    next(err);
  }
};

exports.deleteCompanyPrefix = async (req, res, next) => {
  try {
    const _id = req.params.companyPrefixId;
    let companyPrefix = await CompanyPrefix.deleteOne({ _id });

    res.json({ message: "delete companyPrefix successfully", companyPrefix });
  } catch (err) {
    next(err);
  }
};
