const { Op } = require("sequelize");
const fs = require("fs");

const {
  merchant,
  merchantAddress,
  merchantRelation,
  merchantDocumentArray
} = require("../models");

function delete_file(path) {
  fs.unlink(path, err => {
    if (err) throw err;
    console.log(path + " was deleted");
  });
}

exports.getAllMerchant = async (req, res, next) => {
  try {
    const merchantData = await merchant.findAll({
      include: [
        {
          model: merchantAddress,
          as: "merchantAddress"
        },
        {
          model: merchantRelation,
          as: "merchantRelation"
        },
        {
          model: merchantDocumentArray,
          as: "merchantDocumentArray"
        }
      ],
      order: [["updatedAt", "DESC"]]
    });

    res.status(200).json({ merchantData });
  } catch (err) {
    next(err);
  }
};

exports.getBySearch = async (req, res, next) => {
  try {
    const typeTextSearch = req.query.typeTextSearch || "";
    const textSearch = req.query.textSearch || "";
    const status = req.query.status || "";
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;

    let query = {};

    if (textSearch !== "") {
      query[typeTextSearch] = { [Op.like]: `%${textSearch}%` };
    }

    if (status !== "") {
      if (status !== "all") {
        query["status"] = status;
      }
    }

    query["deletedAt"] = { [Op.eq]: null };
    console.log("query:", query);

    const merchantData = await merchant.findAndCountAll({
      where: query,
      order: [["updatedAt", "DESC"]],
      include: [
        {
          model: merchantAddress,
          as: "merchantAddress"
        },
        {
          model: merchantRelation,
          as: "merchantRelation"
        },
        {
          model: merchantDocumentArray,
          as: "merchantDocumentArray"
        }
      ],
      offset: page * limit,
      limit: limit
    });

    const merchants = merchantData.rows;
    const total = merchantData.count;

    res.status(200).json({ merchants, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getBySearchViewOnly = async (req, res, next) => {
  try {
    const typeTextSearch = req.query.typeTextSearch || "";
    const textSearch = req.query.textSearch || "";
    const status = req.query.status || "";
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;

    let query = {};

    if (textSearch !== "") {
      query[typeTextSearch] = { [Op.like]: `%${textSearch}%` };
    }

    if (status !== "") {
      if (status !== "all") {
        query["status"] = status;
      }
    }

    query["deletedAt"] = { [Op.eq]: null };
    console.log("query:", query);

    const merchantData = await merchant.findAndCountAll({
      where: query,
      order: [["updatedAt", "DESC"]],
      include: [
        {
          model: merchantAddress,
          as: "merchantAddress"
        },
        {
          model: merchantRelation,
          as: "merchantRelation"
        },
        {
          model: merchantDocumentArray,
          as: "merchantDocumentArray"
        }
      ],
      offset: page * limit,
      limit: limit
    });

    const merchants = merchantData.rows;
    const total = merchantData.count;

    res.status(200).json({ merchants, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getMerchantDropdown = async (req, res, next) => {
  try {
    const merchants = await merchant.findAll({
      where: {
        status: { [Op.ne]: "saveDraft" },
        deletedAt: { [Op.eq]: null }
      },
      attributes: ["realMerchantId", "companyName", "name"],
      order: [["realMerchantId", "DESC"]]
    });
    res.status(200).json({ merchant: merchants });
  } catch (err) {
    next(err);
  }
};

exports.getMerchantById = async (req, res, next) => {
  try {
    const { merchantId } = req.params;
    console.log("merchantId:", merchantId);

    const merchantData = await merchant.findAll({
      where: { _id: merchantId },
      include: [
        {
          model: merchantAddress,
          as: "merchantAddress"
        },
        {
          model: merchantRelation,
          as: "merchantRelation"
        },
        {
          model: merchantDocumentArray,
          as: "merchantDocumentArray"
        }
      ]
    });

    res.status(200).json({ merchantData });
  } catch (err) {
    next(err);
  }
};

exports.createMerchant = async (req, res, next) => {
  try {
    let { input, merchantAddressData, merchantRelationData } = req.body;
    const inputData = JSON.parse(input);
    const arrayDocument = req?.files?.arrayDocument || [];
    const merchantAddressArray = JSON.parse(merchantAddressData);
    const merchantRelationArray = JSON.parse(merchantRelationData);

    console.log("------------------------------------------------");
    console.log("inputData:", inputData);
    console.log("------------------------------------------------");
    console.log("arrayDocument:", arrayDocument);
    console.log("------------------------------------------------");
    console.log("merchantAddressArray:", merchantAddressArray);
    console.log("------------------------------------------------");
    console.log("merchantRelationArray:", merchantRelationArray);
    console.log("------------------------------------------------");

    let {
      // ข้อมูลผู้ค้า
      realMerchantId, // รหัสผู้ค้า
      companyPrefix, // คำนำหน้าบริษัท
      companyName, // ชื่อบริษัท
      prefix, // คำนำหน้าบุคคล
      name, // ชื่อบุคคล
      phoneNumber, // เบอร์โทรศัพท์
      email, // email
      // ไม่มี เลขที่ประจำตัวผู้เสีบภาษี

      // ข้อมูลการจัดซื้อ
      paymentTerm, //เงื่อนไขการชำระเงิน
      contactName, // ผู้ติดต่อ

      //ข้อมูลบัญชี
      bankAccountNumber, // เลขบัญชีธนาคาร
      bankAccountDetail, // รายละเอียดบัญชีธนาคาร
      bankCode, // รหัสธนาคาร
      bankBranchCode, // รหัสสาขา
      taxpayerNumber,
      idCardNumber,

      // กลุ่มประเภท
      creditorCategory, // เจ้าหนี้

      status
    } = inputData;

    const checkCompanyNameDup = await merchant.findOne({
      where: { companyName: companyName }
    });
    console.log("checkCompanyNameDup:", checkCompanyNameDup);

    if (!checkCompanyNameDup) {
      const merchantData = await merchant.create({
        realMerchantId,
        companyPrefix,
        companyName,
        prefix,
        name,
        phoneNumber,
        email,
        paymentTerm,
        contactName,
        bankAccountNumber,
        bankAccountDetail,
        bankCode,
        bankBranchCode,
        taxpayerNumber,
        idCardNumber,
        creditorCategory,
        status
      });
      //   console.log("merchantData:", merchantData);

      const merchantId = merchantData.dataValues._id;
      //   console.log("merchantId:", merchantId);

      if (arrayDocument.length > 0) {
        for (el of arrayDocument) {
          await merchantDocumentArray.create({
            document: el.filename,
            merchantId
          });
        }
      }

      for (const address of merchantAddressArray) {
        await merchantAddress.create({
          ...address,
          merchantId
        });
      }

      for (const relation of merchantRelationArray) {
        await merchantRelation.create({
          ...relation,
          merchantId
        });
      }

      res.json({ message: "create merchant successfully", merchantData });
    } else {
      res.status(200).json({ message: "This name already exists." });
    }
  } catch (err) {
    next(err);
  }
};

exports.updateMerchant = async (req, res, next) => {
  try {
    const { merchantId } = req.params;
    const {
      input,
      merchantAddressData,
      merchantRelationData,
      existArrayDocument
    } = req.body;
    const merchantAddressArray = JSON.parse(merchantAddressData);
    const merchantRelationArray = JSON.parse(merchantRelationData);
    const inputObject = JSON.parse(input);

    let existArrayDocumentArray;
    if (existArrayDocument) {
      existArrayDocumentArray = JSON.parse(existArrayDocument);
    }
    const arrayDocument = req?.files?.arrayDocument || [];

    console.log("-------------------------------");
    console.log("merchantId:", merchantId);
    console.log("merchantAddressArray:", merchantAddressArray);
    console.log("merchantRelationArray:", merchantRelationArray);
    console.log("inputObject:", inputObject);
    console.log("arrayDocument:", arrayDocument);
    console.log("existArrayDocumentArray:", existArrayDocumentArray);
    console.log("-------------------------------");

    let {
      // ข้อมูลผู้ค้า
      realMerchantId,
      companyPrefix,
      companyName,
      prefix,
      name,
      phoneNumber,
      email,
      paymentTerm,
      contactName,
      bankAccountNumber,
      bankAccountDetail,
      bankCode,
      bankBranchCode,
      taxpayerNumber,
      idCardNumber,
      creditorCategory,
      status
    } = inputObject;

    const merchantInfo = await merchantDocumentArray.findAll({
      where: { merchantId: merchantId }
    });
    console.log("merchantInfo:", merchantInfo);

    const oldDocumentArray = merchantInfo;
    console.log("oldDocumentArray:", oldDocumentArray);

    if (arrayDocument.length > 0) {
      // console.log("arrayDocument:", arrayDocument);
      for (el of arrayDocument) {
        await merchantDocumentArray.create({
          document: el.filename,
          merchantId: merchantId
        });
      }
    }

    let notExistArrayDocument = [];
    function getNotExistDocument(existArray, oldDocumentArray, notExistArray) {
      const existObjects = existArray.map(obj => obj.document + obj._id);
      console.log("existObjects:", existObjects);
      console.log("oldDocumentArray----:", oldDocumentArray);
      for (let i = 0; i < oldDocumentArray.length; i++) {
        if (
          !existObjects.includes(
            oldDocumentArray[i].document + oldDocumentArray[i]._id
          )
        ) {
          notExistArray.push(oldDocumentArray[i]);
        }
      }
      console.log("notExistArray----:", notExistArray);
      return notExistArray;
    }

    if (existArrayDocumentArray) {
      notExistArrayDocument = getNotExistDocument(
        existArrayDocumentArray,
        oldDocumentArray,
        notExistArrayDocument
      );
    }
    console.log("notExistArrayDocument:", notExistArrayDocument);
    console.log("existArrayDocumentArray:", existArrayDocumentArray);

    if (notExistArrayDocument.length > 0) {
      for (let i = 0; i < notExistArrayDocument.length; i++) {
        await merchantDocumentArray.destroy({
          where: {
            _id: notExistArrayDocument[i]._id,
            merchantId: merchantId
          }
        });
        delete_file(`./public/documents/${notExistArrayDocument[i].document}`);
      }
    }

    await merchant.update(
      {
        ...inputObject
      },
      {
        where: { _id: merchantId }
      }
    );

    for (const address of merchantAddressArray) {
      await merchantAddress.update(
        { ...address },
        { where: { _id: merchantId } }
      );
    }

    for (const relation of merchantRelationArray) {
      await merchantRelation.update(
        { ...relation },
        { where: { _id: merchantId } }
      );
    }

    res.status(200).json({
      message: "update merchant successfully"
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteMerchant = async (req, res, next) => {
  try {
    const { merchantId } = req.params;
    const { reason } = req.body;

    console.log("merchantId:", merchantId);
    console.log("reason:", reason);

    const merchantById = await merchant.findByPk(merchantId);

    if (merchantById.status == "saveDraft") {
      await merchantById.destroy();
    } else {
      console.log("merchantById:", merchantById);
      merchantById.deletedAt = new Date();
      merchantById.reason = reason;
      // console.log("merchant.reason:", merchant.reason);
      await merchantById.save();
    }

    res.status(200).json({ merchantById });
  } catch (err) {
    next(err);
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const merchantDate = await merchant.destroy({
      where: {
        name: {
          [Op.ne]: null
        }
      }
    });

    res.status(200).json({ merchantDate });
  } catch (err) {
    next(err);
  }
};