const {
  asset,
  pkAsset,
  assetImage,
  subComponentAsset,
  assetDocument,
  building,
  transfer,
  borrow,
  transferHasAsset,
  borrowHasAsset,
} = require("../models");
const Type = require("../models").type;
const AssetImage = require("../models").assetImage;
const AssetDocument = require("../models").assetDocument;
const { Op } = require("sequelize");
const sequelize = require("sequelize");
const fs = require("fs");
const moment = require("moment/moment");
const sapAuthService = require("../services/sap/auth");
const sapAssetMasterService = require("../services/sap/assetMaster");
const sapCapitalizationService = require("../services/sap/capitalization");
const sapRetirementService = require("../services/sap/retirement");
const sapFixedAssetDepreciation = require("../services/sap/FixedAssetDepreciationValue");
const { parse } = require("path");

function delete_file(path) {
  fs.unlink(path, (err) => {
    if (err) throw err;
    console.log(path + " was deleted");
  });
}

exports.createAsset = async (req, res, next) => {
  // เหลือ create transfer

  try {
    const {
      genDataJSON,
      input,
      duplicatedArrayImage,
      baseArrayImage,
      baseArrayDocument,
      duplicatedArrayDocument,
    } = req.body;

    console.log("req.body:", req.body);

    const inputObject = JSON.parse(input);

    let {
      engProductName,
      productName,
      type,
      kind,
      unit,
      brand,
      model,
      size,
      quantity,
      source,
      category,
      acquiredType,
      group,
      pricePerUnit,
      assetGroupNumber,
      distributeToSector,
      guaranteedMonth,
      purposeOfUse,
      status,
      insuranceStartDate,
      insuranceExpiredDate,

      //สัญญาจัดซื้อ
      acquisitionMethod,
      moneyType,
      deliveryDocument,
      contractNumber,
      receivedDate,
      seller,
      price,
      billNumber,
      purchaseYear,
      purchaseDate,
      documentDate,

      // การจำหน่าย
      salesDocument,
      distributeDocumentDate,
      distributeApprovalReleaseDate,
      distributeStatus,
      distributionNote,

      // ค่าเสื่อม
      depreciationStartDate,
      depreciationRegisterDate,
      depreciationReceivedDate,
      depreciationPrice,
      depreciationYearUsed,
      depreciationCarcassPrice,

      // ค่าเสื่อมรายปี
      accumulateDepreciationStartDate,
      accumulateDepreciationRegisterDate,
      accumulateDepreciationReceivedDate,
      accumulateDepreciationPrice,
      accumulateDepreciationYearUsed,
      accumulateDepreciationCarcassPrice,

      // สถานที่ตั้ง
      transferDocumentNumber,
      subSector,
      handler,
      building,
      floor,
      room, // note วันที่ย้ายเข้า - ย้ายออก
      name_recorder,
      name_courier,
      name_approver,
    } = inputObject;
    let otherInputObject = {};

    console.log("inputObject", inputObject);

    const baseArrayImageObj = JSON.parse(baseArrayImage);
    const baseArrayDocumentObj = JSON.parse(baseArrayDocument);
    const arrayImage = req?.files?.arrayImage || [];
    const arrayDocument = req?.files?.arrayDocument || [];

    // subComponentAsset
    console.log("genDataJSON:", genDataJSON);

    const genDataArray = JSON.parse(genDataJSON);
    console.log("genDataArray:", genDataArray);

    let newestRealAssetId;
    let newestAsset = await asset.findOne({
      attributes: ["realAssetId"],
      order: [["createdAt", "DESC"]],
    });
    console.log("newestAsset : ", newestAsset);

    if (newestAsset == null) {
      newestRealAssetId = 0;
    } else {
      newestRealAssetId = newestAsset.realAssetId;
    }
    if (status != "saveDraft") {
      status = "inStock";
    }
    if (status == "saveDraft") {
      const createdAsset = await asset.create({
        ...inputObject,
        realAssetId: parseInt(newestRealAssetId) + 1,
      });

      const newAssetId = createdAsset.dataValues._id;
      console.log("newAssetId:", newAssetId);

      for (let i = 0; i < baseArrayImageObj.length; i++) {
        const roomImage = arrayImage[i];

        // console.log("roomImage:", roomImage);
        await assetImage.create({
          image: roomImage.filename,
          assetId: newAssetId,
        });
        // console.log("Uploaded roomImage:", roomImage);
      }

      for (let d = 0; d < baseArrayDocumentObj.length; d++) {
        const documentArray = arrayDocument[d];

        // console.log("documentArray:", documentArray);
        await assetDocument.create({
          document: documentArray.filename,
          assetId: newAssetId,
        });
        // console.log("Uploaded documentArray:", documentArray);
      }

      // Create subComponentAsset
      for (let i = 0; i < genDataArray.length; i++) {
        const subComponentData = genDataArray[i];
        await subComponentAsset.create({
          ...subComponentData,
          assetId: newAssetId,
        });
      }
    } else {
      const getAssetClass = await Type.findOne({ name: type });
      let AssetClass;
      if (getAssetClass == null) {
        AssetClass = "1206160101.101";
      } else {
        AssetClass = getAssetClass.value;
      }
      const responseLogin = await sapAuthService.login();
      const sessionId = responseLogin.data.SessionId;

      for (let i = 0; i < quantity; i++) {
        let dataQuery = {
          params: {
            $filter: `ItemCode eq '${genDataArray[i].assetNumber}'`,
          },
        };
        const responseCheckAlreadyAsset = await sapAssetMasterService.read(
          dataQuery,
          sessionId
        );
        if (responseCheckAlreadyAsset.data.value.length > 0) {
          return res
            .status(400)
            .json({ message: "This assetNumber already exists" });
        }
        const createdAsset = await asset.create({
          assetNumber: genDataArray[i].assetNumber,
          serialNumber: genDataArray[i].serialNumber,
          replacedAssetNumber: genDataArray[i].replacedAssetNumber,
          asset01: genDataArray[i].asset01,
          sector: genDataArray[i].sector,
          ...inputObject,
          depreciationStartDate: depreciationStartDate,
          reserved: false,
          realAssetId: parseInt(newestRealAssetId) + 1,
        });
        const newAssetId = createdAsset.dataValues._id;
        console.log("newAssetId:", newAssetId);

        for (let j = 0; j < baseArrayImageObj.length; j++) {
          const roomImage = arrayImage[quantity * j + i];
          console.log("roomImage:", roomImage);
          await assetImage.create({
            image: roomImage.filename,
            assetId: newAssetId,
          });
        }

        for (let j = 0; j < baseArrayDocumentObj.length; j++) {
          const documentArray = arrayDocument[quantity * j + i];

          await assetDocument.create({
            document: documentArray.filename,
            assetId: newAssetId,
          });
        }

        let dataInsertAssetMaster = {
          ItemCode: genDataArray[i].assetNumber,
          ItemName: productName,
          ItemType: "itFixedAssets",
          AssetClass: AssetClass,
        };
        console.log("dataInsertAssetMaster", dataInsertAssetMaster);
        const responseCreateAssetMaster = await sapAssetMasterService.create(
          dataInsertAssetMaster,
          sessionId
        );
        console.log("responseCreateAssetMaster:", responseCreateAssetMaster);
        if (
          depreciationStartDate &&
          depreciationRegisterDate &&
          depreciationReceivedDate
        ) {
          let dataInsertCapitalization = {
            PostingDate: depreciationStartDate.split("T")[0],
            DocumentDate: depreciationStartDate.split("T")[0],
            // AssetValueDate: depreciationReceivedDate.split("T")[0],
            AssetValueDate: depreciationStartDate.split("T")[0],
            BPLId: "1",
            Remarks: "Capitalization",
            AssetDocumentLineCollection: [
              {
                AssetNumber: genDataArray[i].assetNumber,
                Quantity: 1,
                TotalLC: parseInt(price),
              },
            ],
            AssetDocumentAreaJournalCollection: [
              {
                DepreciationArea: "TFRS",
                JournalRemarks: "Capitalization-Test",
              },
            ],
          };
          console.log("dataInsertCapitalization", dataInsertCapitalization);

          const responseCreateCapitalization =
            await sapCapitalizationService.create(
              dataInsertCapitalization,
              sessionId
            );
          console.log(
            "responseCreateCapitalization : ",
            responseCreateCapitalization
          );
          await asset.update(
            {
              sapDocEntry: responseCreateCapitalization.data.DocEntry,
            },
            {
              where: {
                _id: newAssetId,
              },
            }
          );
        }

        if (distributeStatus === true) {
          let dataInsertRetirement = {
            PostingDate: distributeDocumentDate.split("T")[0],
            DocumentDate: distributeDocumentDate.split("T")[0],
            AssetValueDate: distributeApprovalReleaseDate.split("T")[0],
            DocumentType: "adtScrapping",
            BPLId: "1",
            Remarks: " Retirement By Asset Management System",
            AssetDocumentLineCollection: [
              {
                AssetNumber: genDataArray[i].assetNumber,
              },
            ],
          };
          const responseCreateRetirement = await sapRetirementService.create(
            dataInsertRetirement,
            sessionId
          );
          console.log("responseCreateRetirement : ", responseCreateRetirement);
        }
      }
    }

    res.status(200).json({ message: "Successfully created" });
  } catch (err) {
    next(err);
  }
};

exports.deleteAsset = async (req, res, next) => {
  try {
    const remove = await asset.findOne({
      where: {
        _id: req.params.assetId,
      },
    });
    if (!remove) {
      createError("this post was not found", 400);
    }

    if (remove.status === "saveDraft") {
      await remove.destroy();
    } else {
      remove.reason = req.body.reason;
      remove.deletedAt = new Date();
      await remove.save();
      // let dataForCancelCapitalization = {
      //   CancellationOption: "coByOriginalDocumentDate",
      //   Code: remove.AssetNumber,
      // };
      // const responseLogin = await sapAuthService.login();
      // const sessionId = responseLogin.data.SessionId;
      // const responseCancelCapitalization =
      //   await sapCapitalizationService.cancel(
      //     dataForCancelCapitalization,
      //     sessionId
      //   );
      // const responseCancelAssetMaster = await sapAssetMasterService.cancel(
      //   remove.AssetNumber,
      //   sessionId
      // );
    }

    res.status(200).json({ message: "Delete success" });
  } catch (err) {
    next(err);
  }
};

exports.deleteSubComponentAsset = async (req, res, next) => {
  try {
    const removeSubComponentAsset = await subComponentAsset.findOne({
      where: {
        _id: req.body.id,
      },
    });

    if (removeSubComponentAsset) {
      await removeSubComponentAsset.destroy();
      res.status(200).json({ message: "Delete successfully" });
    } else {
      throw new Error("This subComponentAsset does not exist");
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllAsset = async (req, res, next) => {
  try {
    const getAllAsset = await asset.findAll({});
    const puregetAllAssetData = JSON.parse(JSON.stringify(getAllAsset));
    console.log("puregetAllAssetData:", puregetAllAssetData);

    res.status(200).json({ asset: getAllAsset });
  } catch (err) {
    next(err);
  }
};

exports.getAllBuilding = async (req, res, next) => {
  try {
    // แบบ1
    // const building = await Asset.find(
    //   { building: { $exists: true } },
    //   { building: 1, _id: 0 }
    // );

    // แบบ2
    const buildingData = await building.findAll({
      where: {
        [Op.and]: [
          { deletedAt: { [Op.ne]: null } },
          { building: { [Op.ne]: null } },
        ],
      },
      attributes: ["building"],
    });

    res.json({ building: buildingData });
  } catch (err) {
    next(err);
  }
};

exports.getBySearch = async (req, res, next) => {
  try {
    // for one search but can find in 2 field(serialNumber,productName)
    // const search = req.query.search || "";

    // for 2 field search
    const typeTextSearch = req.query.typeTextSearch || "";
    const textSearch = req.query.textSearch || "";
    // const productName = req.query.productName || "";
    // const typeOfAsset = req.query.typeOfAsset || "";
    const status = req.query.status || "";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const sector = req.query.sector || "";
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    // console.log(req.query);
    // console.log(moment().endOf("day").toDate())

    let modifiedDateFrom = "";
    if (dateFrom) {
      const dateFromObj = new Date(dateFrom);
      // dateFromObj.setFullYear(dateFromObj.getFullYear() - 543);
      // dateFromObj.setHours(dateFromObj.getHours() - 7);
      modifiedDateFrom = dateFromObj.toString();
      // console.log(modifiedDateFrom);
    }

    let modifiedDateTo = "";
    if (dateTo) {
      const dateToObj = new Date(dateTo);
      // dateToObj.setFullYear(dateToObj.getFullYear() - 543);
      // dateToObj.setHours(dateToObj.getHours() - 7);
      modifiedDateTo = dateToObj.toString();
      // console.log(modifiedDateTo);
    }

    let queryArray = [];

    if (textSearch !== "") {
      queryArray.push({
        [typeTextSearch]: { [Op.like]: `%${textSearch}%` },
      });
    }
    if (status !== "") {
      queryArray.push({ status: status });
    } else {
      queryArray.push({
        status: {
          [Op.like]: `%${status}%`,
        },
      });
    }
    if (dateFrom !== "") {
      queryArray.push({
        createdAt: {
          [Op.gte]: new Date(modifiedDateFrom),
          [Op.lte]: moment().endOf("day").toDate(),
        },
      });
    }
    if (dateTo !== "") {
      queryArray.push({ createdAt: { [Op.lte]: new Date(modifiedDateTo) } });
    }
    if (dateFrom !== "" && dateTo !== "") {
      queryArray.push({
        createdAt: {
          [Op.gte]: new Date(modifiedDateFrom),
          [Op.lte]: new Date(modifiedDateTo),
        },
      });
    }
    if (sector !== "") {
      queryArray.push({ sector: sector });
    }
    queryArray.push({ deletedAt: { [Op.eq]: null } });
    console.log(queryArray, "queryArray");
    const assetData = await asset.findAll({
      where: { [Op.and]: queryArray },
      // include: [{ model: Asset, require: false, as: "assets" }],
      order: [["updatedAt", "DESC"]],
      offset: page * limit,
      limit: limit,
    });
    // for show how many pages
    const total = await asset.count({ where: { [Op.and]: queryArray } });

    // work for seach name by productName and specific isPackage :false
    // const asset = await Asset.find({
    //   $or: [
    //     { building },
    //     {name: { $regex: productName, $options: "i" }},
    //     { department },
    //     { sector },
    //   ],
    //   // ,$or:[{ building }],
    //   $and: [{ isPackage: false }],
    // });

    res.json({ asset: assetData, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getAssetById = async (req, res, next) => {
  // เหลือ join transfer,borrow
  try {
    const assetId = req.params.assetId;

    const assetData = await asset.findOne({
      where: {
        _id: assetId,
      },
      include: [
        {
          model: assetImage,
          require: false,
          as: "assetImages",
        },
        {
          model: assetDocument,
          require: false,
          as: "assetDocuments",
        },
        {
          model: subComponentAsset,
          require: false,
          as: "subComponentAssets",
        },
        {
          model: borrowHasAsset,
          require: false,
          as: "borrowHasAssetsData",
          include: [
            {
              model: borrow,
              as: "TB_BORROW",
            },
          ],
        },
        {
          model: transferHasAsset,
          require: false,
          as: "transferHasAssetsData",
          include: [
            {
              model: transfer,
              as: "TB_TRANSFER",
            },
          ],
        },
      ],
      // include: [
      //   {
      //     model: assetDocument,
      //     require: false,
      //     as: "assetDocuments",
      //   },
      // ],
    });
    if (assetData == null) {
      return res.json({ message: "This asset not found" });
    }
    // const asset = await Asset.findById({ _id: assetId });
    res.json({ asset: assetData });
  } catch (err) {
    next(err);
  }
};

exports.getSectorForSearch = async (req, res, next) => {
  try {
    const sector = await asset.findAll({
      where: {
        [Op.and]: [
          { deletedAt: { [Op.eq]: null } },
          { sector: { [Op.ne]: null } },
          { sector: { [Op.ne]: "" } },
        ],
      },
      attributes: [
        // ["_id", "_id"],
        ["sector", "sector"],
        [sequelize.fn("COUNT", sequelize.col("sector")), "numberOfzipcodes"],
      ],
      group: "sector",
      raw: true,
    });
    res.json({ sector });
  } catch (err) {
    next(err);
  }
};

exports.getByProductSelector = async (req, res, next) => {
  try {
    // for one search but can find in 2 field(serialNumber,productName)
    // const search = req.query.search || "";

    // for 2 field search
    const assetNumber = req.query.assetNumber || "";
    const productName = req.query.productName || "";

    let queryAssetArray = [];
    let queryPackageAssetArray = [];
    // for 2 field search
    if (assetNumber !== "") {
      queryAssetArray.push({
        assetNumber: {
          [Op.like]: `%${assetNumber}%`,
        },
      });
      queryPackageAssetArray.push({
        assetNumber: {
          [Op.like]: `%${assetNumber}%`,
        },
      });
    }
    if (productName !== "") {
      queryAssetArray.push({
        productName: {
          [Op.like]: `%${productName}%`,
        },
      });
      queryPackageAssetArray.push({
        productName: {
          [Op.like]: `%${productName}%`,
        },
      });
    }

    queryAssetArray.push({ deletedAt: { [Op.eq]: null } });
    queryAssetArray.push({ status: { [Op.eq]: "inStock" } });
    queryAssetArray.push({ reserved: { [Op.eq]: false } });
    queryPackageAssetArray.push({ deletedAt: { [Op.eq]: null } });
    queryPackageAssetArray.push({ status: { [Op.eq]: "inStock" } });
    queryPackageAssetArray.push({ reserved: { [Op.eq]: false } });

    // Filter for packageAssetId
    queryAssetArray.push({ packageAssetId: { [Op.eq]: null } });

    console.log(queryAssetArray, "queryAssetArray");
    console.log(queryPackageAssetArray, "queryPackageAssetArray");
    let assetData = await asset.findAll({
      where: { [Op.and]: queryAssetArray },
      attributes: [
        ["productName", "_id"],
        [sequelize.fn("COUNT", sequelize.col("*")), "quantity"],
      ],
      group: "productName",
      raw: false,
    });
    console.log(2342, assetData);
    let packageAssetData = await pkAsset.findAll({
      where: { [Op.and]: queryPackageAssetArray },
      attributes: [
        ["productName", "_id"],
        [sequelize.fn("COUNT", sequelize.col("productName")), "quantity"],
      ],
      group: "productName",
      raw: true,
    });

    // let asset = await Asset.aggregate([
    //   { $match: query },
    //   {
    //     $group: {
    //       _id: "$productName",
    //       quantity: { $sum: 1 },
    //       results: { $push: "$$ROOT" },
    //     },
    //   },
    //   // {
    //   //   $sort: {
    //   //     createdAt: -1,
    //   //   },
    //   // },
    // ]);

    // let packageAsset = await PackageAsset.aggregate([
    //   { $match: queryPackageAsset },
    //   {
    //     $group: {
    //       _id: "$productName",
    //       quantity: { $sum: 1 },
    //       results: { $push: "$$ROOT" },
    //     },
    //   },
    //   // {
    //   //   $sort: {
    //   //     createdAt: -1,
    //   //   },
    //   // },
    // ]);

    assetData = assetData.concat(packageAssetData);

    console.log(assetData.length);
    // console.log(asset.length);

    res.json({ asset: assetData });
  } catch (err) {
    next(err);
  }
};

exports.getByAssetNumberSelector = async (req, res, next) => {
  try {
    // for one search but can find in 2 field(serialNumber,productName)
    // const search = req.query.search || "";

    // for 2 field search
    const assetNumber = req.query.assetNumber || "";
    const productName = req.query.productName || "";

    let queryAssetArray = [];
    let queryPackageAssetArray = [];

    // for 2 field search
    if (assetNumber !== "") {
      queryAssetArray.push({
        assetNumber: {
          [Op.like]: `%${assetNumber}%`,
        },
      });
      queryPackageAssetArray.push({
        assetNumber: {
          [Op.like]: `%${assetNumber}%`,
        },
      });
    }
    if (productName !== "") {
      queryAssetArray.push({
        productName: {
          [Op.like]: `%${productName}%`,
        },
      });
      queryPackageAssetArray.push({
        productName: {
          [Op.like]: `%${productName}%`,
        },
      });
    }
    queryAssetArray.push({ deletedAt: { [Op.eq]: null } });
    queryAssetArray.push({ distributeStatus: { [Op.eq]: false } });
    queryAssetArray.push({ status: { [Op.eq]: "inStock" } });
    queryAssetArray.push({ reserved: { [Op.eq]: false } });
    queryPackageAssetArray.push({ deletedAt: { [Op.eq]: null } });
    queryAssetArray.push({ distributeStatus: { [Op.eq]: false } });
    queryPackageAssetArray.push({ status: { [Op.eq]: "inStock" } });
    queryPackageAssetArray.push({ reserved: { [Op.eq]: false } });

    // Filter for packageAssetId
    queryAssetArray.push({ packageAssetId: { [Op.eq]: null } });
    // query["packageAssetId"] = { $exists: false };

    console.log(queryAssetArray, "queryAssetArray");
    console.log(queryPackageAssetArray, "queryPackageAssetArray");
    let assetData = await asset.findAll({
      where: { [Op.and]: queryAssetArray },
    });
    let packageAssetData = await pkAsset.findAll({
      where: { [Op.and]: queryPackageAssetArray },
    });

    assetData = assetData.concat(packageAssetData);

    console.log(assetData.length);

    res.json({ asset: assetData });
  } catch (err) {
    next(err);
  }
};

exports.getQuantitySelector = async (req, res, next) => {
  try {
    // for one search but can find in 2 field(serialNumber,productName)
    // const search = req.query.search || "";

    // for 2 field search
    const assetNumber = req.query.assetNumber || "";
    const productName = req.query.productName || "";

    let queryAssetArray = [];
    let queryPackageAssetArray = [];
    // for 2 field search
    if (assetNumber !== "") {
      queryAssetArray.push({
        assetNumber: {
          [Op.like]: `%${assetNumber}%`,
        },
      });
      queryPackageAssetArray.push({
        assetNumber: {
          [Op.like]: `%${assetNumber}%`,
        },
      });
    }
    if (productName !== "") {
      queryAssetArray.push({
        productName: {
          [Op.like]: `%${productName}%`,
        },
      });
      queryPackageAssetArray.push({
        productName: {
          [Op.like]: `%${productName}%`,
        },
      });
    }

    queryAssetArray.push({ deletedAt: { [Op.eq]: null } });
    queryAssetArray.push({ status: { [Op.eq]: "inStock" } });
    queryAssetArray.push({ reserved: { [Op.eq]: false } });
    queryPackageAssetArray.push({ deletedAt: { [Op.eq]: null } });
    queryPackageAssetArray.push({ status: { [Op.eq]: "inStock" } });
    queryPackageAssetArray.push({ reserved: { [Op.eq]: false } });

    // Filter for packageAssetId
    queryAssetArray.push({ packageAssetId: { [Op.eq]: null } });

    console.log(queryAssetArray, "queryAssetArray");
    console.log(queryPackageAssetArray, "queryPackageAssetArray");

    let quantity = 0;

    let assetData = await asset.findAll({
      where: { [Op.and]: queryAssetArray },
    });
    let packageAssetData = await pkAsset.findAll({
      where: { [Op.and]: queryPackageAssetArray },
    });
    if (assetData.length > 0) {
      // for show how many quantity of this product
      quantity = await asset.count({ where: { [Op.and]: queryAssetArray } });
    } else if (packageAssetData.length > 0) {
      quantity = await pkAsset.count({
        where: { [Op.and]: queryPackageAssetArray },
      });
    }

    res.json({ quantity });
  } catch (err) {
    next(err);
  }
};

exports.updateAsset = async (req, res, next) => {
  try {
    const assetId = req.params.assetId;
    const { genDataJSON, input, existArrayImage, existArrayDocument } =
      req.body;
    // console.log(req.body);

    const inputObject = JSON.parse(input);

    // console.log("existArrayImageArray", existArrayImageArray);

    // console.log("inputObject",inputObject)

    // console.log("insuranceStartDate", insuranceStartDate);
    // console.log("insuranceExpiredDate", insuranceExpiredDate);
    let {
      engProductName,
      productName,
      type,
      kind,
      unit,
      brand,
      model,
      size,
      quantity,
      source,
      sector,
      category,
      acquiredType,
      group,
      pricePerUnit,
      assetGroupNumber,
      distributeToSector,
      guaranteedMonth,
      purposeOfUse,
      asset01,
      replacedAssetNumber,
      serialNumber,
      status,
      insuranceStartDate,
      insuranceExpiredDate,

      //สัญญาจัดซื้อ
      acquisitionMethod,
      moneyType,
      deliveryDocument,
      contractNumber,
      receivedDate,
      seller,
      price,
      billNumber,
      purchaseYear,
      purchaseDate,
      documentDate,

      // การจำหน่าย
      salesDocument,
      distributeDocumentDate,
      distributeApprovalReleaseDate,
      distributeStatus,
      distributionNote,

      // ค่าเสื่อม
      depreciationStartDate,
      depreciationRegisterDate,
      depreciationReceivedDate,
      depreciationPrice,
      depreciationYearUsed,
      depreciationCarcassPrice,

      // ค่าเสื่อมรายปี
      accumulateDepreciationStartDate,
      accumulateDepreciationRegisterDate,
      accumulateDepreciationReceivedDate,
      accumulateDepreciationPrice,
      accumulateDepreciationYearUsed,
      accumulateDepreciationCarcassPrice,

      reserved,

      // สถานที่ตั้ง
      transferDocumentNumber,
      subSector,
      handler,
      building,
      floor,
      room, // note วันที่ย้ายเข้า - ย้ายออก
      name_recorder,
      name_courier,
      name_approver,
    } = inputObject;
    let existArrayImageArray = [];
    let existArrayDocumentArray = [];

    // arrayImage , arrayDocument มีเฉพาะ new file ที่ส่งเข้ามา
    const arrayImage = req?.files?.arrayImage || [];
    const arrayDocument = req?.files?.arrayDocument || [];

    const assetById = await asset.findByPk(assetId);

    // if (status != "saveDraft") {
    existArrayImageArray = JSON.parse(existArrayImage);
    existArrayDocumentArray = JSON.parse(existArrayDocument);
    // }
    // let newestTransferDocumentNumber;
    // let newestTransfer = await Transfer.findOne({
    //   order: [["createdAt", "DESC"]],
    //   attributes: ["_id", "transferDocumentNumber"],
    // });

    // console.log("newestTransfer", newestTransfer);
    // if (newestTransfer == null) {
    //   newestTransferDocumentNumber = 0;
    // } else {
    //   newestTransferDocumentNumber = parseInt(
    //     newestTransfer.transferDocumentNumber
    //   );
    // }
    if (assetById.status == "saveDraft" && status == "inStock") {
      //flow like create but delete old
      let lengthOfBaseImageArray = arrayImage.length / quantity;
      let lengthOfBaseDocumentArray = arrayDocument.length / quantity;
      let newestRealAssetId = parseInt(assetById.realAssetId) - 1;
      const genDataArray = JSON.parse(genDataJSON);
      const getAssetClass = await Type.findOne({ name: type });
      let AssetClass;
      if (getAssetClass == null) {
        AssetClass = "1206160101.101";
      } else {
        AssetClass = getAssetClass.value;
      }
      const responseLogin = await sapAuthService.login();
      const sessionId = responseLogin.data.SessionId;
      for (let i = 0; i < quantity; i++) {
        let dataQuery = {
          params: {
            $filter: `ItemCode eq '${genDataArray[i].assetNumber}'`,
          },
        };
        const responseCheckAlreadyAsset = await sapAssetMasterService.read(
          dataQuery,
          sessionId
        );
        if (responseCheckAlreadyAsset.data.value.length > 0) {
          return res
            .status(400)
            .json({ message: "This assetNumber already exists" });
        }
        newestRealAssetId = newestRealAssetId + 1;
        console.log("depreciationStartDates : ", depreciationStartDate);
        const assetCreated = await asset.create({
          realAssetId: newestRealAssetId,
          assetNumber: genDataArray[i].assetNumber,
          serialNumber: genDataArray[i].serialNumber,
          replacedAssetNumber: genDataArray[i].replacedAssetNumber,
          asset01: genDataArray[i].asset01,
          sector: genDataArray[i].sector,
          ...inputObject,
          reserved: false,
        });
        for (let j = 0; j < existArrayImageArray.length; j++) {
          if (i == 0) {
            await assetImage.create({
              image: existArrayImageArray[j].image,
              assetId: assetCreated.dataValues._id,
            });
          } else {
            // console.log(existArrayImageArray[j].image);
            let newImageSplit = existArrayImageArray[j].image.split("-");
            let newImageName = "";
            // console.log("newImageSplit", newImageSplit.length);
            for (let u = 0; u < newImageSplit.length; u++) {
              if (u == 0) {
                newImageName = newImageName + `${Date.now()}-`;
              } else {
                newImageName = newImageName + newImageSplit[u];
              }
            }
            await assetImage.create({
              image: newImageName,
              assetId: assetCreated.dataValues._id,
            });
            // console.log("ImageName", existArrayImageArray[j].image);
            // console.log("newImageName", newImageName);
            duplicate_file(
              `./public/pics/${existArrayImageArray[j].image}`,
              `./public/pics/${newImageName}`
            );
          }
        }
        for (let j = 0; j < existArrayDocumentArray.length; j++) {
          if (i == 0) {
            await assetDocument.create({
              document: existArrayDocumentArray[j].document,
              assetId: assetCreated.dataValues._id,
            });
          } else {
            // console.log(existArrayDocumentArray[j].document);
            let newDocumentSplit =
              existArrayDocumentArray[j].document.split("-");
            let newDocumentName = "";
            // console.log("newImageSplit", newImageSplit.length);
            for (let u = 0; u < newImageSplit.length; u++) {
              if (u == 0) {
                newDocumentName = newDocumentName + `${Date.now()}-`;
              } else {
                newDocumentName = newDocumentName + newDocumentSplit[u];
              }
            }
            await assetDocument.create({
              document: newDocumentName,
              assetId: assetCreated.dataValues._id,
            });
            // console.log("DocumentName", existArrayDocumentArray[j].document);
            // console.log("newDocumentName", newDocumentName);
            duplicate_file(
              `./public/documents/${existArrayDocumentArray[j].document}`,
              `./public/documents/${newDocumentName}`
            );
          }
        }
        for (let j = 0; j < lengthOfBaseImageArray; j++) {
          await assetImage.create({
            image: arrayImage[quantity * j + i].filename,
            assetId: assetCreated.dataValues._id,
          });
        }
        for (let j = 0; j < lengthOfBaseDocumentArray; j++) {
          await assetDocument.create({
            document: arrayDocument[quantity * j + i].filename,
            assetId: assetCreated.dataValues._id,
          });
        }

        // sap service

        let dataInsertAssetMaster = {
          ItemCode: genDataArray[i].assetNumber,
          ItemName: productName,
          ItemType: "itFixedAssets",
          AssetClass: AssetClass,
        };
        console.log("dataInsertAssetMaster", dataInsertAssetMaster);
        const responseCreateAssetMaster = await sapAssetMasterService.create(
          dataInsertAssetMaster,
          sessionId
        );
        if (
          depreciationStartDate &&
          depreciationRegisterDate &&
          depreciationReceivedDate
        ) {
          let dataInsertCapitalization = {
            PostingDate: depreciationStartDate.split("T")[0],
            DocumentDate: depreciationStartDate.split("T")[0],
            AssetValueDate: depreciationStartDate.split("T")[0],
            BPLId: "1",
            Remarks: "Capitalization",
            AssetDocumentLineCollection: [
              {
                AssetNumber: genDataArray[i].assetNumber,
                Quantity: 1,
                TotalLC: parseInt(price),
              },
            ],
            AssetDocumentAreaJournalCollection: [
              {
                DepreciationArea: "TFRS",
                JournalRemarks: "Capitalization-Test",
              },
            ],
          };
          console.log("dataInsertCapitalization", dataInsertCapitalization);

          const responseCreateCapitalization =
            await sapCapitalizationService.create(
              dataInsertCapitalization,
              sessionId
            );
          console.log(
            "responseCreateCapitalization : ",
            responseCreateCapitalization
          );
          await asset.update(
            {
              sapDocEntry: responseCreateCapitalization.data.DocEntry,
            },
            {
              where: {
                _id: assetCreated.dataValues._id,
              },
            }
          );
        }
        if (distributeStatus === true) {
          let dataInsertRetirement = {
            PostingDate: distributeDocumentDate.split("T")[0],
            DocumentDate: distributeDocumentDate.split("T")[0],
            AssetValueDate: distributeApprovalReleaseDate.split("T")[0],
            DocumentType: "adtScrapping",
            BPLId: "1",
            Remarks: "Test Retirement By Postman",
            AssetDocumentLineCollection: [
              {
                AssetNumber: genDataArray[i].assetNumber,
              },
            ],
          };
          const responseCreateRetirement = await sapRetirementService.create(
            dataInsertRetirement,
            sessionId
          );
          console.log("responseCreateRetirement : ", responseCreateRetirement);
        }
        // await Transfer.create({
        //   transferDocumentNumber: newestTransferDocumentNumber + 1,
        //   transferSector: genDataArray[i].sector,
        //   subSector,
        //   handler,
        //   transfereeSector: genDataArray[i].sector,
        //   building,
        //   floor,
        //   room,

        //   name_recorder,
        //   dateTime_recorder: new Date(),
        //   name_courier,
        //   dateTime_courier: new Date(),
        //   name_approver,
        //   dateTime_approver: new Date(),
        //   status: "done",
        //   assetIdArray: [{ assetId: asset._id }],
        // });
      }
      await asset.destroy({ where: { _id: assetId } });
      return res
        .status(200)
        .json({ message: "This asset id updated successfully" });
    }

    const oldImageArray = await assetImage.findAll({
      where: { assetId: assetId },
    });
    const oldDocumentArray = await assetDocument.findAll({
      where: { assetId: assetId },
    });

    console.log("oldImageArray", oldImageArray);
    console.log("oldDocumentArray", oldDocumentArray);

    if (arrayImage.length > 0) {
      for (el of arrayImage) {
        await assetImage.create({
          image: el.filename,
          assetId: assetId,
        });
      }
    }

    if (arrayDocument.length > 0) {
      for (el of arrayDocument) {
        await assetDocument.create({
          document: el.filename,
          assetId: assetId,
        });
      }
    }

    let notExistArrayImage = [];
    let notExistArrayDocument = [];

    function getNotExistImage(existArray, oldImageArray, notExistArray) {
      const existObjects = existArray.map((obj) => obj.image + obj._id);

      for (let i = 0; i < oldImageArray.length; i++) {
        if (
          !existObjects.includes(oldImageArray[i].image + oldImageArray[i]._id)
        ) {
          notExistArray.push(oldImageArray[i]);
        }
      }

      return notExistArray;
    }
    notExistArrayImage = getNotExistImage(
      existArrayImageArray,
      oldImageArray,
      notExistArrayImage
    );

    function getNotExistDocument(existArray, oldDocumentArray, notExistArray) {
      const existObjects = existArray.map((obj) => obj.document + obj._id);

      for (let i = 0; i < oldDocumentArray.length; i++) {
        if (
          !existObjects.includes(
            oldDocumentArray[i].document + oldDocumentArray[i]._id
          )
        ) {
          notExistArray.push(oldDocumentArray[i]);
        }
      }

      return notExistArray;
    }
    notExistArrayDocument = getNotExistDocument(
      existArrayDocumentArray,
      oldDocumentArray,
      notExistArrayDocument
    );

    // Update the imageArray and documentArray fields of the asset in Schema
    if (notExistArrayImage.length > 0) {
      console.log("notExistArrayImage", notExistArrayImage);
      for (let i = 0; i < notExistArrayImage.length; i++) {
        await assetImage.destroy({ where: { _id: notExistArrayImage[i]._id } });
        delete_file(`./public/pics/${notExistArrayImage[i].image}`);
      }
    }
    if (notExistArrayDocument.length > 0) {
      for (let i = 0; i < notExistArrayDocument.length; i++) {
        await assetDocument.destroy({
          where: { _id: notExistArrayDocument[i]._id },
        });
        delete_file(`./public/documents/${notExistArrayDocument[i].document}`);
      }
    }

    assetById.status = status ?? assetById.status;
    assetById.engProductName = engProductName;
    assetById.productName = productName;
    assetById.type = type;
    assetById.kind = kind;
    assetById.unit = unit;
    assetById.brand = brand;
    assetById.model = model;
    assetById.size = size;
    assetById.quantity = quantity;
    assetById.source = source;
    assetById.sector = sector;
    assetById.category = category;
    assetById.acquiredType = acquiredType;
    assetById.group = group;
    assetById.pricePerUnit = pricePerUnit;
    assetById.assetGroupNumber = assetGroupNumber;
    assetById.distributeToSector = distributeToSector;
    assetById.guaranteedMonth = guaranteedMonth;
    assetById.purposeOfUse = purposeOfUse;
    assetById.insuranceStartDate = insuranceStartDate;
    assetById.insuranceExpiredDate = insuranceExpiredDate;
    assetById.asset01 = asset01;
    assetById.serialNumber = serialNumber;
    assetById.replacedAssetNumber = replacedAssetNumber;

    //สัญญาจัดซื้อ
    assetById.acquisitionMethod = acquisitionMethod;
    assetById.moneyType = moneyType;
    assetById.deliveryDocument = deliveryDocument;
    assetById.contractNumber = contractNumber;
    assetById.receivedDate = receivedDate;
    assetById.seller = seller;
    assetById.price = price;
    assetById.billNumber = billNumber;
    assetById.purchaseYear = purchaseYear;
    assetById.purchaseDate = purchaseDate;
    assetById.documentDate = documentDate;

    // การจำหน่าย
    assetById.salesDocument = salesDocument;
    assetById.distributeDocumentDate = distributeDocumentDate;
    assetById.distributeApprovalReleaseDate = distributeApprovalReleaseDate;
    assetById.distributeStatus = distributeStatus;
    assetById.distributionNote = distributionNote;

    // ค่าเสื่อม
    assetById.depreciationStartDate = depreciationStartDate;
    assetById.depreciationRegisterDate = depreciationRegisterDate;
    assetById.depreciationReceivedDate = depreciationReceivedDate;
    assetById.depreciationPrice = depreciationPrice;
    assetById.depreciationYearUsed = depreciationYearUsed;
    assetById.depreciationCarcassPrice = depreciationCarcassPrice;

    // ค่าเสื่อมรายปี
    assetById.accumulateDepreciationStartDate = accumulateDepreciationStartDate;
    assetById.accumulateDepreciationRegisterDate =
      accumulateDepreciationRegisterDate;
    assetById.accumulateDepreciationReceivedDate =
      accumulateDepreciationReceivedDate;
    assetById.accumulateDepreciationPrice = accumulateDepreciationPrice;
    assetById.accumulateDepreciationYearUsed = accumulateDepreciationYearUsed;
    assetById.accumulateDepreciationCarcassPrice =
      accumulateDepreciationCarcassPrice;

    assetById.reserved = reserved || false;
    if (status == "saveDraft") {
      const genDataArray = JSON.parse(genDataJSON);
      await subComponentAsset.destroy({ where: { assetId: assetId } });
      for (let i = 0; i < genDataArray.length; i++) {
        const subComponentData = genDataArray[i];
        await subComponentAsset.create({
          ...subComponentData,
          assetId: assetId,
        });
      }
    }

    console.log("assetById", assetById);

    await assetById.save();
    if (
      assetById.status != "saveDraft" &&
      assetById.sapDocEntry == null &&
      depreciationStartDate &&
      depreciationRegisterDate &&
      depreciationReceivedDate
    ) {
      const responseLogin = await sapAuthService.login();
      const sessionId = responseLogin.data.SessionId;
      let dataInsertCapitalization = {
        PostingDate: depreciationStartDate.split("T")[0],
        DocumentDate: depreciationStartDate.split("T")[0],
        AssetValueDate: depreciationStartDate.split("T")[0],
        BPLId: "1",
        Remarks: "Capitalization",
        AssetDocumentLineCollection: [
          {
            AssetNumber: assetById.assetNumber,
            Quantity: 1,
            TotalLC: parseInt(price),
          },
        ],
        AssetDocumentAreaJournalCollection: [
          {
            DepreciationArea: "TFRS",
            JournalRemarks: "Capitalization-Test",
          },
        ],
      };
      console.log("dataInsertCapitalization", dataInsertCapitalization);

      const responseCreateCapitalization =
        await sapCapitalizationService.create(
          dataInsertCapitalization,
          sessionId
        );
      console.log(
        "responseCreateCapitalization : ",
        responseCreateCapitalization
      );
      await asset.update(
        {
          sapDocEntry: responseCreateCapitalization.data.DocEntry,
        },
        {
          where: {
            _id: assetId,
          },
        }
      );
    }
    if (assetById.status != "saveDraft" && distributeStatus === true) {
      const responseLogin = await sapAuthService.login();
      const sessionId = responseLogin.data.SessionId;
      let dataInsertRetirement = {
        PostingDate: distributeDocumentDate.split("T")[0],
        DocumentDate: distributeDocumentDate.split("T")[0],
        AssetValueDate: distributeApprovalReleaseDate.split("T")[0],
        DocumentType: "adtScrapping",
        BPLId: "1",
        Remarks: "Retirement on Asset Management System",
        AssetDocumentLineCollection: [
          {
            AssetNumber: assetById.assetNumber,
          },
        ],
      };
      const responseCreateRetirement = await sapRetirementService.create(
        dataInsertRetirement,
        sessionId
      );
      console.log("responseCreateRetirement : ", responseCreateRetirement);
    }
    res.status(200).json({ message: "This asset id updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getDepreciationByAssetNumber = async (req, res, next) => {
  try {
    const assetNumber = req.query.assetNumber;
    const year = req.query.year;

    if (!assetNumber || !year) {
      return res.status(412).json({ message: "Validation Failed" });
    }
    let assetData;
    const responseLogin = await sapAuthService.login();
    const sessionId = responseLogin.data.SessionId;
    let dataQueryCheckAlreadyAsset = {
      params: {
        $filter: `ItemCode eq '${assetNumber}'`,
      },
    };
    const responseCheckAlreadyAsset = await sapAssetMasterService.read(
      dataQueryCheckAlreadyAsset,
      sessionId
    );
    if (responseCheckAlreadyAsset.data.value.length == 0) {
      return res
        .status(204)
        .json({ message: "This assetNumber does not exist." });
    } else {
      const assetByAssetNumber = await asset.findOne({
        where: { assetNumber },
        attributes: [
          "_id",
          "realAssetId",
          "assetNumber",
          "productName",
          "price",
          "depreciationStartDate",
          "depreciationRegisterDate",
          "depreciationReceivedDate",
          "depreciationYearUsed",
        ],
      });
      if (assetByAssetNumber === null) {
        const pkAssetByAssetNumber = await pkAsset.findOne({
          where: { assetNumber },
          // include: [{ model: asset, as: "assets" }],
          attributes: [
            "_id",
            "realAssetId",
            "assetNumber",
            "productName",
            "price",
            "depreciationStartDate",
            "depreciationRegisterDate",
            "depreciationReceivedDate",
            "depreciationYearUsed",
          ],
        });

        if (pkAssetByAssetNumber === null) {
          return res.status(412).json({ message: "This AssetNumber No Data" });
        }
        assetData = pkAssetByAssetNumber;
      } else {
        assetData = assetByAssetNumber;
      }
    }

    let dataQuery = {};
    let dataDepreciationValueArray = [];
    const currentYear = new Date();
    const AssetValuedate = new Date(assetData.depreciationStartDate);
    console.log("currentYearGetFullYear : ", currentYear.getFullYear());
    const yearDiff = currentYear.getFullYear() - AssetValuedate.getFullYear();
    console.log("yearDiff : ", yearDiff);
    if (yearDiff != 0) {
      for (let i = 0; i < yearDiff; i++) {
        dataQuery = {
          params: {
            periodCat: `'${parseInt(AssetValuedate.getFullYear() + (i + 1))}'`,
            itemCode: `'${assetNumber}'`,
          },
        };
        const responsegetDepreciation =
          await sapFixedAssetDepreciation.sqlQuery(dataQuery, sessionId);
        dataDepreciationValueArray = [
          ...dataDepreciationValueArray,
          ...responsegetDepreciation.data.value,
        ];
      }
    } else {
      dataQuery = {
        params: { periodCat: `'${year}'`, itemCode: `'${assetNumber}'` },
      };
      const responsegetDepreciation = await sapFixedAssetDepreciation.sqlQuery(
        dataQuery,
        sessionId
      );
      dataDepreciationValueArray = responsegetDepreciation.data.value;
    }

    // let
    const currentMonth = new Date()
      .toISOString()
      .split("T")[0]
      .replaceAll("-", "")
      .slice(0, 6);
    console.log("currentMonth : ", currentMonth);
    let depreciationPresentMonth = 0,
      depreciationCumulativePrice = 0,
      depreciationYearPrice = 0,
      depreciationBookValue = 0;
    let currentMonthFlag = false;
    const matchingObjects = [];
    for (let i = 0; i < dataDepreciationValueArray.length; i++) {
      if (currentMonthFlag == false) {
        depreciationCumulativePrice =
          depreciationCumulativePrice +
          dataDepreciationValueArray[i].OrdDprPlan;
      }
      if (dataDepreciationValueArray[i].FromDate.startsWith(currentMonth)) {
        matchingObjects.push({ index: i, ...dataDepreciationValueArray[i] });
        depreciationPresentMonth = dataDepreciationValueArray[i].OrdDprPlan;
        currentMonthFlag = true;
      }

      depreciationYearPrice =
        depreciationYearPrice + dataDepreciationValueArray[i].OrdDprPlan;
    }
    depreciationBookValue = assetData.price - depreciationCumulativePrice;
    return res.status(200).json({
      assetData: assetData,
      depreciationPresentMonth,
      depreciationCumulativePrice,
      depreciationYearPrice,

      depreciationBookValue,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllAssetForRepairDropdown = async (req, res, next) => {
  const queryStatus = [
    "inStock",
    "withdrawn",
    "borrowed",
    "transfered",
    "broken",
  ];
  const currentDate = new Date();

  try {
    let assets = await asset.findAll({
      where: { status: { [Op.in]: queryStatus } },
      attributes: [
        "assetNumber",
        "assetGroupNumber",
        "insuranceStartDate",
        "insuranceExpiredDate",
        "sector",
        "productName",
        "asset01",
      ],
    });

    const packageAssets = await pkAsset.findAll({
      where: {
        status: { [Op.in]: queryStatus },
      },
      attributes: [
        "assetNumber",
        "assetGroupNumber",
        "insuranceStartDate",
        "insuranceExpiredDate",
        "sector",
        "productName",
        "asset01",
      ],
    });

    assets = assets.concat(packageAssets);

    // Process each asset
    const processedAssets = assets.map((asset) => {
      // Check if the current date is within the insurance dates
      const isInsurance =
        currentDate >= asset.insuranceStartDate &&
        currentDate <= asset.insuranceExpiredDate;

      // Add the isInsurance field to the asset
      return { ...asset.dataValues, isInsurance };
    });

    res.json({ assets: processedAssets });
  } catch (err) {
    next(err);
  }
};
