const { user, role, accessScreen, Sequelize } = require("../models");
const createError = require("../utils/createError");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const fs = require("fs");
var nodemailer = require("nodemailer");
var verfifyAndTokenService = require("../services/authService.js/verifyAndTokenService");
const jwt = require("jsonwebtoken");

let refreshTokenArray = [];

exports.getAllUsers = async (req, res, next) => {
  try {
    const userGetAll = await user.findAll({});
    res.status(200).json({ userGetAll });
  } catch (err) {
    next(err);
  }
};

exports.getSectorForSearch = async (req, res, next) => {
  try {
    const sectors = await user.findAll({
      attributes: [
        "sector",
        [Sequelize.fn("COUNT", Sequelize.col("sector")), "numberOfzipcodes"],
      ],
      where: {
        deletedAt: null,
        sector: {
          [Sequelize.Op.ne]: null,
          [Sequelize.Op.ne]: "",
        },
      },
      group: ["sector"],
      raw: true,
      order: [["sector", "ASC"]],
    });

    res.json({ sectors });
  } catch (err) {
    next(err);
  }
};

exports.getUserRepairDropdown = async (req, res, next) => {
  try {
    const userData = await user.findAll({
      attributes: [
        "_id",
        "thaiFirstName",
        "thaiLastName",
        "sector",
        "phoneNumber",
      ],
    });

    res.status(200).json({ user: userData });
  } catch (err) {
    next(err);
  }
};

exports.getBySearch = async (req, res, next) => {
  try {
    const typeTextSearch = req.query.typeTextSearch || "";
    const textSearch = req.query.textSearch || "";
    const sector = req.query.sector || "";
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    let where = {};

    if (textSearch !== "") {
      where[typeTextSearch] = { [Op.iLike]: `%${textSearch}%` };
    }
    if (sector !== "") {
      where["sector"] = sector;
    }
    where["deletedAt"] = null;

    console.log(where, "where");

    const users = await user.findAndCountAll({
      where,
      order: [["updatedAt", "DESC"]],
      offset: page * limit,
      limit,
    });

    const total = users.count;

    res.json({ user: users.rows, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // console.log("userId:", userId);
    const userData = await user.findOne({
      where: { _id: userId },
      attributes: { exclude: ["password"] },
      include: {
        model: role,
        as: "TB_ROLE",
      },
    });
    res.status(200).json({ userData });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { input } = req.body;
    // console.log("input:", input);
    console.log(" input.username:", input.username);

    const checkUser = await user.findOne({
      where: { username: input.username },
    });

    if (checkUser) {
      createError("invalid username or password", 400);
    }

    const {
      thaiPrefix,
      thaiFirstName,
      thaiLastName,
      engPrefix,
      engFirstName,
      engLastName,
      idCard,
      sex,
      birthDate,
      password,
      username,
      passwordStartDate,
      passwordEndDate,

      // ข้อมูลพนักงาน
      employeeId,
      professionalLicenseNumber,
      sector,
      medicalBranchCode,
      thaiPosition,
      engPosition,
      personnelTypeCode,
      hospital,
      fromHospital,
      toHospital,

      // ที่อยู่
      houseNo,
      villageNo,
      soi,
      separatedSoi,
      road,
      village,
      district,
      subdistrict,
      province,
      zipcode,

      // ข้อมูลการติดต่อ
      email,
      phoneNumber,
      homePhoneNumber,
      lineId,
      facebook,

      // ตำแหน่ง
      docterType,
      medicalField,

      // บันทึกเหตุการณ์
      dateTimeRecord,
      dateTimeModify,
      dateTimeUpdatePassword,
      userEndDateTime,
      PACSDateTime,
      lastRevisionDateTime,
      level,
      note,
      status,
      roleId,
    } = input;

    // console.log("input:", input);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // console.log("hashedPassword:", hashedPassword);

    // const roleData = await role.findOne({
    //   where: {
    //     _id: roleId,
    //   },
    // });
    // console.log("roleData:", roleData);

    // const roleDataId = roleData.dataValues._id;
    // console.log("roleDataId:", roleDataId);

    const createUser = await user.create({
      thaiPrefix,
      thaiFirstName,
      thaiLastName,
      engPrefix,
      engFirstName,
      engLastName,
      idCard,
      sex,
      birthDate,
      password: hashedPassword,
      username,
      passwordStartDate,
      passwordEndDate,

      // ข้อมูลพนักงาน
      employeeId,
      professionalLicenseNumber,
      sector,
      medicalBranchCode,
      thaiPosition,
      engPosition,
      personnelTypeCode,
      hospital,
      fromHospital,
      toHospital,

      // ที่อยู่
      houseNo,
      villageNo,
      soi,
      separatedSoi,
      road,
      village,
      district,
      subdistrict,
      province,
      zipcode,

      // ข้อมูลการติดต่อ
      email,
      phoneNumber,
      homePhoneNumber,
      lineId,
      facebook,

      // ตำแหน่ง
      docterType,
      medicalField,

      // บันทึกเหตุการณ์
      dateTimeRecord,
      dateTimeModify,
      dateTimeUpdatePassword,
      userEndDateTime,
      PACSDateTime,
      lastRevisionDateTime,
      level,
      note,
      status,
      roleId,
    });

    res.status(200).json({ createUser });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { input } = req.body;

    console.log("userId:", userId);
    console.log("input:", input);

    const {
      thaiPrefix,
      thaiFirstName,
      thaiLastName,
      engPrefix,
      engFirstName,
      engLastName,
      idCard,
      sex,
      birthDate,
      username,
      passwordStartDate,
      passwordEndDate,

      // ข้อมูลพนักงาน
      employeeId,
      professionalLicenseNumber,
      sector,
      medicalBranchCode,
      thaiPosition,
      engPosition,
      personnelTypeCode,
      hospital,
      fromHospital,
      toHospital,

      // ที่อยู่
      houseNo,
      villageNo,
      soi,
      separatedSoi,
      road,
      village,
      district,
      subdistrict,
      province,
      zipcode,

      // ข้อมูลการติดต่อ
      email,
      phoneNumber,
      homePhoneNumber,
      lineId,
      facebook,

      // ตำแหน่ง
      docterType,
      medicalField,

      // บันทึกเหตุการณ์
      dateTimeRecord,
      dateTimeModify,
      dateTimeUpdatePassword,
      userEndDateTime,
      PACSDateTime,
      lastRevisionDateTime,
      level,
      note,
      status,
      roleId,
    } = input;

    const userById = await user.findOne({
      where: { _id: userId },
      attributes: { exclude: ["password"] },
      include: [{ model: role, as: "TBM_ROLE" }],
    });
    console.log("userById:", userById);
    // console.log("input:", input);

    const roleData = await role.findOne({
      where: {
        _id: roleId,
      },
    });
    console.log("roleData:", roleData);

    const roleDataId = roleData.dataValues._id;
    console.log("roleDataId:", roleDataId);

    userById.thaiPrefix = thaiPrefix;
    userById.thaiFirstName = thaiFirstName;
    userById.thaiLastName = thaiLastName;
    userById.engPrefix = engPrefix;
    userById.engFirstName = engFirstName;
    userById.engLastName = engLastName;
    userById.idCard = idCard;
    userById.sex = sex;
    userById.birthDate = birthDate;
    userById.username = username;
    userById.passwordStartDate = passwordStartDate;
    userById.passwordEndDate = passwordEndDate;

    // ข้อมูลพนักงาน
    userById.employeeId = employeeId;
    userById.professionalLicenseNumber = professionalLicenseNumber;
    userById.sector = sector;
    userById.medicalBranchCode = medicalBranchCode;
    userById.thaiPosition = thaiPosition;
    userById.engPosition = engPosition;
    userById.personnelTypeCode = personnelTypeCode;
    userById.hospital = hospital;
    userById.fromHospital = fromHospital;
    userById.toHospital = toHospital;

    // ที่อยู่
    userById.houseNo = houseNo;
    userById.villageNo = villageNo;
    userById.soi = soi;
    userById.separatedSoi = separatedSoi;
    userById.road = road;
    userById.village = village;
    userById.district = district;
    userById.subdistrict = subdistrict;
    userById.province = province;
    userById.zipcode = zipcode;

    // ข้อมูลการติดต่อ
    userById.email = email;
    userById.phoneNumber = phoneNumber;
    userById.homePhoneNumber = homePhoneNumber;
    userById.lineId = lineId;
    userById.facebook = facebook;

    // ตำแหน่ง
    userById.role = role;
    userById.docterType = docterType;
    userById.medicalField = medicalField;

    // บันทึกเหตุการณ์
    userById.dateTimeRecord = dateTimeRecord;
    userById.dateTimeModify = dateTimeModify;
    userById.dateTimeUpdatePassword = dateTimeUpdatePassword;
    userById.userEndDateTime = userEndDateTime;
    userById.PACSDateTime = PACSDateTime;
    userById.lastRevisionDateTime = lastRevisionDateTime;
    userById.level = level;
    userById.note = note;
    userById.status = status;
    userById.roleId = roleDataId;
    await userById.save();

    res.status(201).json({ message: "updateUser success" });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const userData = await user.findOne({
      where: { username: username },
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
          "note",
        ],
      },
      include: [
        {
          model: role,
          as: "TB_ROLE",
          require: false,
          attributes: ["_id", "roleName"],
          include: [
            {
              model: accessScreen,
              as: "roleAccessScreen",
              attributes: ["_id", "name", "order"],
            },
          ],
        },
      ],
    });
    if (!userData) {
      createError("invalid username or password", 400);
    }

    const accessScreenData = await accessScreen.findAll({
      where: { roleId: userData.TB_ROLE._id },
    });

    if (
      userData &&
      (await bcrypt.compare(password, userData.dataValues.password))
    ) {
      const a = delete userData.dataValues.password;
      const token = verfifyAndTokenService.generateAccessToken(userData);
      const refreshToken =
        verfifyAndTokenService.generateRefreshToken(userData);
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log("decoded", decoded);

      userData.lastLoginDate = new Date();
      userData.loginFlag = true;
      await userData.save();

      res.status(200).json({
        _id: userData._id,
        email: userData.email,
        role: userData.TB_ROLE,
        screen: accessScreenData,
        token,
        refreshToken,
      });
    } else {
      createError("invalid password", 401);
    }
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const { newPassword } = req.query;

    console.log("userId:", userId);
    console.log("newPassword:", newPassword);

    const userData = await user.findOne({
      where: {
        _id: userId,
      },
      attributes: ["password"],
    });
    console.log("userData:", userData);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log("hashedPassword:", hashedPassword);
    userData.password = hashedPassword;
    console.log("  userData.password :", userData.password);
    // await userData.save();
    await user.update(
      {
        password: hashedPassword,
      },
      {
        where: {
          _Id: userId,
        },
      }
    );
    res.status(400).json({ message: "resetPassword success" });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    console.log("userId:", userId);
    console.log("reason:", reason);

    const userById = await user.findByPk(userId);
    console.log("userById:", userById);

    userById.deletedAt = new Date();
    userById.reason = reason;
    console.log("userById.reason:", userById.reason);
    console.log(" userById.deletedAt:", userById.deletedAt);
    await userById.save();
    res.status(200).json({ message: "deleteUser success" });
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    let { email, link } = req.query;
    console.log("email:", email);
    console.log("link:", link);

    const userData = await user.findOne({
      where: { email },
      attributes: ["_id", "email"],
    });
    console.log("userData:", userData);

    if (userData === null) {
      return res.send({ message: "email invalid" });
    }
    email = "nanineyt@gmail.com"; //must get out
    const userId = userData.dataValues._id;
    // console.log("userId:", userId);
    link = "www.google.co.th/"; //must get out
    sendEmail(email, link, userId);
    res.send({ message: "sent email" });
  } catch (err) {
    next(err);
  }
};

function sendEmail(Email, link, userId) {
  const myemail = "jittiphat.won@devdeva.tech";
  const passemail = "rxbmcriutxndauwj";

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: myemail,
      pass: passemail,
    },
  });
  let from = `Panacea Plus ${myemail}`;

  const image = fs.readFileSync("./image/background.jpg");
  const imageBase64 = image.toString("base64");
  var mailOptions = {
    from: from,
    to: Email,
    subject: "Reset password",
    attachments: [
      {
        filename: "background.jpg",
        path: "./image/background.jpg",
        cid: "background", //same cid value as in the html img src
      },
      {
        filename: "icon.png",
        path: "./image/icon.png",
        cid: "icon", //same cid value as in the html img src
      },
    ],
    html:
      ` <html>
      <head>
        <style>
          .bgimg {
            background-image: url('cid:background');
          }
          .tip span {
            margin-left:10px; 
          } 
          img {
            vertical-align: middle; 
          }
        </style>
      </head>
      <body>
      <div class="bgimg" style=" width: 350px; border-radius: 5px; padding: 10px 15px; font-family: Arial; text-align: center;">
      <span style=" margin-bottom:5; font-size: 34px; font-weight: 700; color: #38821D;"><img src="cid:icon" width="80" height="80" > DEDE Hospital</span>
      <p style="margin-top:5; margin-bottom:0; font-family:IBM Plex Sans Thai; font-size: 24px; font-weight: 500; color: #38821D; ">ระบบบริหารงานทรัพย์สิน</p>
      <p style="margin-bottom:5; font-size: 14px; font-weight: 300; color: #38821D;">Asset Management</p>
      <div
        style="background-color: rgba(255, 255, 255, 0.6);
          width: 100%;
          border-radius: 5px;
          padding: 30px 30px;
          box-sizing: border-box;
          text-align: center;
          color: #303030;"
      >
        <p style="padding: 0px">Hi ` +
      Email +
      `,</p>
        <p style="padding: 0px; margin-bottom: 40px; font-size: smaller">
          You recently requested to reset your <br />
          account password
        </p>
        <a
        href="` +
      link +
      `Resetpassword/` +
      `Resetpassword/` +
      userId +
      `"
          style="
            width: 100%;
            padding: 15px 70px;
            max-width: 250px;
            border: none;
            background-color: #38821D;
            border-radius: 5px;
            color: white;
            margin: 10px 0px;
            text-decoration: none;
          "
          onMouseOver="this.style.backgroundColor='#0466BF'"
          onMouseOut="this.style.backgroundColor='#3381ca'"
        >
          Reset password
        </a>

      </div>
      <div style="text-align: center; margin: 20px 0px">

      </div>
    </div>
    </body>
    </html>
    `, // html body
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

exports.logout = async (req, res) => {
  try {
    const userData = req.user;
    console.log("userData : ", userData);
    const userSaveLogout = await user.update(
      { loginFlag: false },
      { where: { _id: userData._id }, returning: false }
    );
    return res.status(200).json({ message: "Logout Successfully" });
  } catch (err) {
    next(err);
  }
};

exports.RefreshToken = async (req, res) => {
  try {
    const refreshtoken = req.body.refreshToken;
    console.log("refresh token working");

    if (!refreshtoken) {
      return res.status(403).send("A token is required");
    }
    jwt.verify(
      refreshtoken,
      process.env.REFRESH_TOKEN,
      async (err, userData) => {
        if (err) return res.status(401).send("Invalid Token");
        userData = userData.userData;
        const User = await user.findByPk(userData._id);
        if (User.loginFlag === false) {
          return res.status(401).send("Invalid Token");
        }
        const accesstoken =
          verfifyAndTokenService.generateAccessToken(userData);
        return res.send({ accesstoken: accesstoken });
      }
    );
  } catch (err) {
    next(err);
  }
};
