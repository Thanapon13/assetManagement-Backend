const { user, role, accessScreen } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createError = require("../utils/createError");

const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.createUser = async (req, res, next) => {
  try {
    const value = req.body.input;
    console.log("value", value);

    const checkUser = await user.findOne({
      where: { username: value.username }
    });

    if (checkUser) {
      createError("invalid username or password", 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(value.password, salt);
    console.log("hashedPassword:", hashedPassword);

    const userCreate = await user.create(value);

    const userId = userCreate.dataValues._id;
    console.log("userId:", userId);

    await role.create({
      roleName: value.role,
      userId: userId
    });

    res.status(201).json({ message: "register success", userCreate });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log("username:", username);
    console.log("password:", password);

    const checkUser = await user.findOne({
      where: { username: username }
    });

    if (!checkUser) {
      createError("invalid username or password", 400);
    }

    const userData = await user.findOne({
      where: { username },
      attributes: {
        exclude: [
          "passwordStartDate",
          "passwordEndDate",
          "lineId",
          "facebook",
          "dateTimeRecord",
          "dateTimeModify",
          "dateTimeUpdatePassword",
          "PACSDateTime",
          "lastRevisionDateTime",
          "note"
        ]
      },
      include: {
        model: role,
        as: "userRole"
      }
    });
    // console.log("userData:", userData);
    if (
      userData &&
      (await bcrypt.compare(password, userData.dataValues.password))
    ) {
      const a = delete userData.dataValues.password;
      console.log("a:", a);

      const token = generateToken({ userData });
      console.log("token:", token);

      //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //   console.log("decoded", decoded);

      //   userData.dataValues.lastLoginDate = new Date();
      //   await userData.save();

      res.status(200).json({ message: "login success" });
    } else {
      createError("invalid credential", 401);
    }
  } catch (err) {
    next(err);
  }
};
