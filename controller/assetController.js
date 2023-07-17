const {
  asset,
  pkAsset,
  assetImage,
  subComponentAsset,
  assetDocument,
  building
} = require("../models");
const AssetImage = require("../models").assetImage;
const AssetDocument = require("../models").assetDocument;
const { Op } = require("sequelize");
const sequelize = require("sequelize");

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
      depreciationProcess,
      depreciationPresentMonth,
      depreciationCumulativePrice,
      depreciationYearPrice,
      depreciationRemainPrice,
      depreciationBookValue,

      // ค่าเสื่อมรายปี
      accumulateDepreciationStartDate,
      accumulateDepreciationRegisterDate,
      accumulateDepreciationReceivedDate,
      accumulateDepreciationPrice,
      accumulateDepreciationYearUsed,
      accumulateDepreciationCarcassPrice,
      accumulateDepreciationProcess,
      accumulateDepreciationPresentMonth,
      accumulateDepreciationCumulativePrice,
      accumulateDepreciationYearPrice,
      accumulateDepreciationRemainPrice,
      accumulateDepreciationBookValue,

      // สถานที่ตั้ง
      transferDocumentNumber,
      subSector,
      handler,
      building,
      floor,
      room, // note วันที่ย้ายเข้า - ย้ายออก
      name_recorder,
      name_courier,
      name_approver
    } = req.body;

    console.log(req.body);

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
      status
    } = inputObject;
    let otherInputObject = {};

    console.log("inputObject", inputObject);

    const baseArrayImageObj = JSON.parse(baseArrayImage);
    const baseArrayDocumentObj = JSON.parse(baseArrayDocument);
    // const inputAssetObject = {
    //   //create ข้อมูลครุภัณฑ์
    //   productName: req.body.productName, // ชื่อไทย
    //   engProductName: req.body.engProductName, // ชื่อภาษาอังกฤษ
    //   type: req.body.type, // ประเภท
    //   kind: req.body.kind,
    //   assetNumber: req.body.assetNumber, //
    //   quantity: req.body.quantity, // จำนวน
    //   unit: req.body.unit, // หน่อยนับ
    //   brand: req.body.brand, // ยี่ห้อ
    //   model: req.body.model, //รุ่น
    //   size: req.body.size, // ขนาด
    //   category: req.body.category, // หมวดหมู่
    //   group: req.body.group, // กลุ่ม
    //   acquiredType: req.body.acquiredType, // ประเภททีได้มา
    //   source: req.body.source, // แหล่งที่ได้มา
    //   purposeOfUse: req.body.purposeOfUse, // วัตถุประสงค์ของการใช้งาน
    //   pricePerUnit: req.body.pricePerUnit, // ราคาต่อหน่วย
    //   guaranteedMonth: req.body.guaranteedMonth, // จำนวนเงินที่เดือนรับประกัน
    //   insuranceStartDate: req.body.insuranceStartDate, // วันที่เริ่มประกัน
    //   insuranceExpiredDate: req.body.insuranceExpiredDate, // วันสิ้นสุดประกัน

    //   //สัญญาการจัดซื้อ
    //   acquisitionMethod: req.body.acquisitionMethod, //วิธีการได้มา
    //   moneyType: req.body.moneyType, //ประเภทของเงิน
    //   contractNumber: req.body.contractNumber, // เลขที่สัญญา
    //   documentDate: req.body.documentDate, // เอกสารใบส่งของ
    //   billNumber: req.body.billNumber, // เลขที่ใบเบิก
    //   receivedDate: req.body.receivedDate, // วันที่รับมอบ
    //   seller: req.body.seller, //ผู้ขาย
    //   price: req.body.price, // ราคาซื้อ
    //   purchaseYear: req.body.purchaseYear, // ปีที่ซื้อ
    //   purchaseDate: req.body.purchaseDate, //วันที่ซื้อ
    //   deliveryDocument: req.body.deliveryDocument, //เอกสารจัดส่ง

    //   // การจำหน่าย
    //   salesDocument: req.body.salesDocument, // เอกสารจำหน่าย
    //   distributeDocumentDate: req.body.distributeDocumentDate, // เอกสารลงวันที่
    //   distributeApprovalReleaseDate: req.body.distributeApprovalReleaseDate, // วันอนุมติจำหน่าย
    //   distributeStatus: req.body.distributeStatus, // สถานะ
    //   distributionNote: req.body.distributionNote, // หมายเหตุ

    //   //status
    //   status: req.body.status,
    // };
    // console.log("inputAssetObject:", inputAssetObject);

    // subComponentAsset
    console.log("genDataJSON:", genDataJSON);

    const genDataArray = JSON.parse(genDataJSON);
    console.log("genDataArray:", genDataArray);

    let newestRealAssetId;
    let newestAsset = await asset.findOne({
      attributes: ["realAssetId"]
    });
    if (newestAsset == null) {
      newestRealAssetId = 0;
    } else {
      newestRealAssetId = newestAsset.realAssetId;
    }

    if (req.body.status != "saveDraft") {
      req.body.status = "inStock";
    }

    if (req.body.status == "saveDraft") {
      const createdAsset = await asset.create({
        ...inputObject,
        insuranceStartDate: insuranceStartDate,
        insuranceExpiredDate: insuranceExpiredDate,

        //สัญญาจัดซื้อ
        acquisitionMethod: acquisitionMethod,
        moneyType: moneyType,
        deliveryDocument: deliveryDocument,
        contractNumber: contractNumber,
        receivedDate: receivedDate,
        seller: seller,
        price: price,
        billNumber: billNumber,
        purchaseYear: purchaseYear,
        purchaseDate: purchaseDate,
        documentDate: documentDate,

        // การจำหน่าย
        salesDocument: salesDocument,
        distributeDocumentDate: distributeDocumentDate,
        distributeApprovalReleaseDate: distributeApprovalReleaseDate,
        distributeStatus: distributeStatus,
        distributionNote: distributionNote,

        // ค่าเสื่อม
        depreciationStartDate: depreciationStartDate,
        depreciationRegisterDate: depreciationRegisterDate,
        depreciationReceivedDate: depreciationReceivedDate,
        depreciationPrice: depreciationPrice,
        depreciationYearUsed: depreciationYearUsed,
        depreciationCarcassPrice: depreciationCarcassPrice,
        depreciationProcess: depreciationProcess,
        depreciationPresentMonth: depreciationPresentMonth,
        depreciationCumulativePrice: depreciationCumulativePrice,
        depreciationYearPrice: depreciationYearPrice,
        depreciationRemainPrice: depreciationRemainPrice,
        depreciationBookValue: depreciationBookValue,

        // ค่าเสื่อมรายปี
        accumulateDepreciationStartDate: accumulateDepreciationStartDate,
        accumulateDepreciationRegisterDate: accumulateDepreciationRegisterDate,
        accumulateDepreciationReceivedDate: accumulateDepreciationReceivedDate,
        accumulateDepreciationPrice: accumulateDepreciationPrice,
        accumulateDepreciationYearUsed: accumulateDepreciationYearUsed,
        accumulateDepreciationCarcassPrice: accumulateDepreciationCarcassPrice,
        accumulateDepreciationProcess: accumulateDepreciationProcess,
        accumulateDepreciationPresentMonth: accumulateDepreciationPresentMonth,
        accumulateDepreciationCumulativePrice:
          accumulateDepreciationCumulativePrice,
        accumulateDepreciationYearPrice: accumulateDepreciationYearPrice,
        accumulateDepreciationRemainPrice: accumulateDepreciationRemainPrice,
        accumulateDepreciationBookValue: accumulateDepreciationBookValue,
        realAssetId: newestRealAssetId + 1
      });

      const newAssetId = createdAsset.dataValues._id;
      console.log("newAssetId:", newAssetId);

      for (let i = 0; i < baseArrayImageObj.length; i++) {
        const roomImage = baseArrayImageObj[i];

        // console.log("roomImage:", roomImage);
        await assetImage.create({
          image: roomImage.filename,
          assetId: newAssetId
        });
        // console.log("Uploaded roomImage:", roomImage);
      }

      for (let d = 0; d < baseArrayDocumentObj.length; d++) {
        const documentArray = baseArrayDocumentObj[d];

        // console.log("documentArray:", documentArray);
        await assetDocument.create({
          document: documentArray.filename,
          assetId: newAssetId
        });
        // console.log("Uploaded documentArray:", documentArray);
      }

      // Create subComponentAsset
      for (let i = 0; i < genDataArray.length; i++) {
        const subComponentData = genDataArray[i];
        await subComponentAsset.create({
          ...subComponentData,
          assetId: newAssetId
        });
      }
    } else {
      for (let i = 0; i < quantity; i++) {
        const createdAsset = await asset.create({
          assetNumber: genDataArray[i].assetNumber,
          serialNumber: genDataArray[i].serialNumber,
          replacedAssetNumber: genDataArray[i].replacedAssetNumber,
          asset01: genDataArray[i].asset01,
          sector: genDataArray[i].sector,
          ...inputObject,
          insuranceStartDate: insuranceStartDate,
          insuranceExpiredDate: insuranceExpiredDate,

          //สัญญาจัดซื้อ
          acquisitionMethod: acquisitionMethod,
          moneyType: moneyType,
          deliveryDocument: deliveryDocument,
          contractNumber: contractNumber,
          receivedDate: receivedDate,
          seller: seller,
          price: price,
          billNumber: billNumber,
          purchaseYear: purchaseYear,
          purchaseDate: purchaseDate,
          documentDate: documentDate,

          // การจำหน่าย
          salesDocument: salesDocument,
          distributeDocumentDate: distributeDocumentDate,
          distributeApprovalReleaseDate: distributeApprovalReleaseDate,
          distributeStatus: distributeStatus,
          distributionNote: distributionNote,

          // ค่าเสื่อม
          depreciationStartDate: depreciationStartDate,
          depreciationRegisterDate: depreciationRegisterDate,
          depreciationReceivedDate: depreciationReceivedDate,
          depreciationPrice: depreciationPrice,
          depreciationYearUsed: depreciationYearUsed,
          depreciationCarcassPrice: depreciationCarcassPrice,
          depreciationProcess: depreciationProcess,
          depreciationPresentMonth: depreciationPresentMonth,
          depreciationCumulativePrice: depreciationCumulativePrice,
          depreciationYearPrice: depreciationYearPrice,
          depreciationRemainPrice: depreciationRemainPrice,
          depreciationBookValue: depreciationBookValue,

          // ค่าเสื่อมรายปี
          accumulateDepreciationStartDate: accumulateDepreciationStartDate,
          accumulateDepreciationRegisterDate:
            accumulateDepreciationRegisterDate,
          accumulateDepreciationReceivedDate:
            accumulateDepreciationReceivedDate,
          accumulateDepreciationPrice: accumulateDepreciationPrice,
          accumulateDepreciationYearUsed: accumulateDepreciationYearUsed,
          accumulateDepreciationCarcassPrice:
            accumulateDepreciationCarcassPrice,
          accumulateDepreciationProcess: accumulateDepreciationProcess,
          accumulateDepreciationPresentMonth:
            accumulateDepreciationPresentMonth,
          accumulateDepreciationCumulativePrice:
            accumulateDepreciationCumulativePrice,
          accumulateDepreciationYearPrice: accumulateDepreciationYearPrice,
          accumulateDepreciationRemainPrice: accumulateDepreciationRemainPrice,
          accumulateDepreciationBookValue: accumulateDepreciationBookValue,
          realAssetId: newestRealAssetId + 1
        });

        const newAssetId = createdAsset.dataValues._id;
        console.log("newAssetId:", newAssetId);

        for (let j = 0; j < baseArrayImageObj.length; j++) {
          const roomImage = baseArrayImageObj[j];
          console.log("roomImage:", roomImage);
          await assetImage.create({
            image: roomImage.filename,
            assetId: newAssetId
          });
        }

        for (let j = 0; j < baseArrayDocumentObj.length; j++) {
          const documentArray = baseArrayDocumentObj[j];

          await assetDocument.create({
            document: documentArray.filename,
            assetId: newAssetId
          });
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
        _id: req.params.assetId
      }
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
        _id: req.body.id
      }
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
          { building: { [Op.ne]: null } }
        ]
      },
      attributes: ["building"]
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
        [typeTextSearch]: { [Op.like]: `%${textSearch}%` }
      });
    }
    if (status !== "") {
      queryArray.push({ status: status });
    } else {
      queryArray.push({
        status: {
          [Op.like]: `%${status}%`
        }
      });
    }
    if (dateFrom !== "") {
      queryArray.push({
        createdAt: {
          [Op.gte]: new Date(modifiedDateFrom),
          [Op.lte]: moment().endOf("day").toDate()
        }
      });
    }
    if (dateTo !== "") {
      queryArray.push({ createdAt: { [Op.lte]: new Date(modifiedDateTo) } });
    }
    if (dateFrom !== "" && dateTo !== "") {
      queryArray.push({
        createdAt: {
          [Op.gte]: new Date(modifiedDateFrom),
          [Op.lte]: new Date(modifiedDateTo)
        }
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
      limit: limit
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
    // const assetData = await asset.aggregate([
    //   { $match: { _id: ObjectID(assetId) } },
    //   // {
    //   //   $lookup: {
    //   //     from: "borrows",
    //   //     localField: "_id",
    //   //     foreignField: "assetIdArray.assetId",
    //   //     as: "BorrowHistory",
    //   //   },
    //   // },
    //   {
    //     $lookup: {
    //       from: "borrows",
    //       let: { assetIds: "$_id" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [{ $in: ["$$assetIds", "$assetIdArray.assetId"] }],
    //             },
    //           },
    //         },
    //         {
    //           $sort: {
    //             borrowDate: -1,
    //           },
    //         },
    //         {
    //           $project: {
    //             borrowIdDoc: 1,
    //             handler: 1,
    //             sector: 1,
    //             borrowDate: 1,
    //             borrowSetReturnDate: 1,
    //             borrowReturnDate: 1,
    //             status: 1,
    //           },
    //         },
    //       ],
    //       as: "borrowHistory",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "transfers",
    //       let: { assetIds: "$_id" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 { $in: ["$$assetIds", "$assetIdArray.assetId"] },
    //                 {
    //                   $or: [
    //                     {
    //                       $eq: ["$status", "done"],
    //                     },
    //                     {
    //                       $eq: ["$status", "approve"],
    //                     },
    //                   ],
    //                 },
    //               ],
    //             },
    //           },
    //         },
    //         {
    //           $sort: {
    //             createdAt: -1,
    //           },
    //         },
    //         {
    //           $project: {
    //             building: 1,
    //             floor: 1,
    //             room: 1,
    //             createdAt: 1,
    //           },
    //         },
    //       ],
    //       as: "tranferHistory",
    //     },
    //   },
    // ]);
    const assetData = await asset.findOne({
      where: {
        _id: assetId
      },
      include: [
        {
          model: assetImage,
          require: false,
          as: "assetImages"
        }
      ]
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
          { sector: { [Op.ne]: "" } }
        ]
      },
      attributes: [
        // ["_id", "_id"],
        ["sector", "sector"],
        [sequelize.fn("COUNT", sequelize.col("sector")), "numberOfzipcodes"]
      ],
      group: "sector",
      raw: true
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
          [Op.like]: `%${assetNumber}%`
        }
      });
      queryPackageAssetArray.push({
        assetNumber: {
          [Op.like]: `%${assetNumber}%`
        }
      });
    }
    if (productName !== "") {
      queryAssetArray.push({
        productName: {
          [Op.like]: `%${productName}%`
        }
      });
      queryPackageAssetArray.push({
        productName: {
          [Op.like]: `%${productName}%`
        }
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
        [sequelize.fn("COUNT", sequelize.col("*")), "quantity"]
      ],
      group: "productName",
      raw: false
    });
    console.log(2342, assetData);
    let packageAssetData = await pkAsset.findAll({
      where: { [Op.and]: queryPackageAssetArray },
      attributes: [
        ["productName", "_id"],
        [sequelize.fn("COUNT", sequelize.col("productName")), "quantity"]
      ],
      group: "productName",
      raw: true
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
          [Op.like]: `%${assetNumber}%`
        }
      });
      queryPackageAssetArray.push({
        assetNumber: {
          [Op.like]: `%${assetNumber}%`
        }
      });
    }
    if (productName !== "") {
      queryAssetArray.push({
        productName: {
          [Op.like]: `%${productName}%`
        }
      });
      queryPackageAssetArray.push({
        productName: {
          [Op.like]: `%${productName}%`
        }
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
    // query["packageAssetId"] = { $exists: false };

    console.log(queryAssetArray, "queryAssetArray");
    console.log(queryPackageAssetArray, "queryPackageAssetArray");
    let assetData = await asset.findAll({
      where: { [Op.and]: queryAssetArray }
    });
    let packageAssetData = await pkAsset.findAll({
      where: { [Op.and]: queryPackageAssetArray }
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
          [Op.like]: `%${assetNumber}%`
        }
      });
      queryPackageAssetArray.push({
        assetNumber: {
          [Op.like]: `%${assetNumber}%`
        }
      });
    }
    if (productName !== "") {
      queryAssetArray.push({
        productName: {
          [Op.like]: `%${productName}%`
        }
      });
      queryPackageAssetArray.push({
        productName: {
          [Op.like]: `%${productName}%`
        }
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
      where: { [Op.and]: queryAssetArray }
    });
    let packageAssetData = await pkAsset.findAll({
      where: { [Op.and]: queryPackageAssetArray }
    });
    if (assetData.length > 0) {
      // for show how many quantity of this product
      quantity = await asset.count({ where: { [Op.and]: queryAssetArray } });
    } else if (packageAssetData.length > 0) {
      quantity = await pkAsset.count({
        where: { [Op.and]: queryPackageAssetArray }
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
    const {
      genDataJSON,
      input,
      existArrayImage,
      existArrayDocument,

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
      depreciationProcess,
      depreciationPresentMonth,
      depreciationCumulativePrice,
      depreciationYearPrice,
      depreciationRemainPrice,
      depreciationBookValue,

      // ค่าเสื่อมรายปี
      accumulateDepreciationStartDate,
      accumulateDepreciationRegisterDate,
      accumulateDepreciationReceivedDate,
      accumulateDepreciationPrice,
      accumulateDepreciationYearUsed,
      accumulateDepreciationCarcassPrice,
      accumulateDepreciationProcess,
      accumulateDepreciationPresentMonth,
      accumulateDepreciationCumulativePrice,
      accumulateDepreciationYearPrice,
      accumulateDepreciationRemainPrice,
      accumulateDepreciationBookValue,

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
      name_approver
    } = req.body;
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
      status
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
    let newestTransferDocumentNumber;
    let newestTransfer = await Transfer.findOne({
      order: [["createdAt", "DESC"]],
      attributes: ["_id", "transferDocumentNumber"]
    });

    console.log("newestTransfer", newestTransfer);
    if (newestTransfer == null) {
      newestTransferDocumentNumber = 0;
    } else {
      newestTransferDocumentNumber = parseInt(
        newestTransfer.transferDocumentNumber
      );
    }
    if (assetById.status == "saveDraft" && status == "inStock") {
      //flow like create but delete old
      let lengthOfBaseImageArray = arrayImage.legth / quantity;
      let lengthOfBaseDocumentArray = arrayDocument.legth / quantity;
      let newestRealAssetId = parseInt(assetById.realAssetId) - 1;
      const genDataArray = JSON.parse(genDataJSON);
      for (let i = 0; i < quantity; i++) {
        let saveImageArray = [];
        let saveDocumentArray = [];
        for (let j = 0; j < existArrayImageArray.length; j++) {
          if (i == 0) {
            saveImageArray.push({ image: existArrayImageArray[j].image });
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
            saveImageArray.push({ image: newImageName });
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
            saveDocumentArray.push({
              document: existArrayDocumentArray[j].document
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
            saveDocumentArray.push({ document: newDocumentName });
            // console.log("DocumentName", existArrayDocumentArray[j].document);
            // console.log("newDocumentName", newDocumentName);
            duplicate_file(
              `./public/documents/${existArrayDocumentArray[j].document}`,
              `./public/documents/${newDocumentName}`
            );
          }
        }
        for (let j = 0; j < lengthOfBaseImageArray; j++) {
          saveImageArray.push({ image: arrayImage[quantity * j + i].filename });
        }
        for (let j = 0; j < lengthOfBaseDocumentArray; j++) {
          saveDocumentArray.push({
            document: arrayDocument[quantity * j + i].filename
          });
        }
        newestRealAssetId = newestRealAssetId + 1;
        const asset = await Asset.create({
          realAssetId: newestRealAssetId,
          assetNumber: genDataArray[i].assetNumber,
          serialNumber: genDataArray[i].serialNumber,
          replacedAssetNumber: genDataArray[i].replacedAssetNumber,
          asset01: genDataArray[i].asset01,
          sector: genDataArray[i].sector,
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
          guaranteedMonth,
          purposeOfUse,
          status,
          pricePerUnit,
          assetGroupNumber,
          distributeToSector,
          insuranceStartDate,
          insuranceExpiredDate,

          //สัญญาจัดซื้อ
          purchaseContract: {
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
            documentDate
          },

          // การจำหน่าย
          distribution: {
            salesDocument,
            distributeDocumentDate,
            distributeApprovalReleaseDate,
            distributeStatus,
            distributionNote
          },

          // ค่าเสื่อม
          depreciationStartDate,
          depreciationRegisterDate,
          depreciationReceivedDate,
          depreciationPrice,
          depreciationYearUsed,
          depreciationCarcassPrice,
          depreciationProcess,
          depreciationPresentMonth,
          depreciationCumulativePrice,
          depreciationYearPrice,
          depreciationRemainPrice,
          depreciationBookValue,

          // ค่าเสื่อมรายปี
          accumulateDepreciationStartDate,
          accumulateDepreciationRegisterDate,
          accumulateDepreciationReceivedDate,
          accumulateDepreciationPrice,
          accumulateDepreciationYearUsed,
          accumulateDepreciationCarcassPrice,
          accumulateDepreciationProcess,
          accumulateDepreciationPresentMonth,
          accumulateDepreciationCumulativePrice,
          accumulateDepreciationYearPrice,
          accumulateDepreciationRemainPrice,
          accumulateDepreciationBookValue,

          genDataArray: [],
          // image
          imageArray: saveImageArray,

          // document
          documentArray: saveDocumentArray,
          reserved: false
        });
        await Transfer.create({
          transferDocumentNumber: newestTransferDocumentNumber + 1,
          transferSector: genDataArray[i].sector,
          subSector,
          handler,
          transfereeSector: genDataArray[i].sector,
          building,
          floor,
          room,

          name_recorder,
          dateTime_recorder: new Date(),
          name_courier,
          dateTime_courier: new Date(),
          name_approver,
          dateTime_approver: new Date(),
          status: "done",
          assetIdArray: [{ assetId: asset._id }]
        });
      }
      await Asset.deleteOne({ _id: assetId });
      return res
        .status(200)
        .json({ message: "This asset id updated successfully" });
    }

    const oldImageArray = assetById.imageArray;
    const oldDocumentArray = assetById.documentArray;

    console.log("oldImageArray", oldImageArray);
    if (arrayImage.length > 0) {
      for (el of arrayImage) {
        await Asset.updateOne(
          { _id: assetId },
          { $push: { imageArray: { image: el.filename } } }
        );
      }
    }

    if (arrayDocument.length > 0) {
      for (el of arrayDocument) {
        await Asset.updateOne(
          { _id: assetId },
          { $push: { documentArray: { document: el.filename } } }
        );
      }
    }

    let notExistArrayImage = [];
    let notExistArrayDocument = [];

    function getNotExistImage(existArray, oldImageArray, notExistArray) {
      const existObjects = existArray.map(obj => obj.image + obj._id);

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
      const existObjects = existArray.map(obj => obj.document + obj._id);

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
        await Asset.updateOne(
          { _id: assetId },
          { $pull: { imageArray: { _id: notExistArrayImage[i].id } } }
        );
        delete_file(`./public/pics/${notExistArrayImage[i].image}`);
      }
    }
    if (notExistArrayDocument.length > 0) {
      for (let i = 0; i < notExistArrayDocument.length; i++) {
        await Asset.updateOne(
          { _id: assetId },
          { $pull: { documentArray: { _id: notExistArrayDocument[i].id } } }
        );
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
    assetById.purchaseContract.acquisitionMethod = acquisitionMethod;
    assetById.purchaseContract.moneyType = moneyType;
    assetById.purchaseContract.deliveryDocument = deliveryDocument;
    assetById.purchaseContract.contractNumber = contractNumber;
    assetById.purchaseContract.receivedDate = receivedDate;
    assetById.purchaseContract.seller = seller;
    assetById.purchaseContract.price = price;
    assetById.purchaseContract.billNumber = billNumber;
    assetById.purchaseContract.purchaseYear = purchaseYear;
    assetById.purchaseContract.purchaseDate = purchaseDate;
    assetById.purchaseContract.documentDate = documentDate;

    // การจำหน่าย
    assetById.distribution.salesDocument = salesDocument;
    assetById.distribution.distributeDocumentDate = distributeDocumentDate;
    assetById.distribution.distributeApprovalReleaseDate =
      distributeApprovalReleaseDate;
    assetById.distribution.distributeStatus = distributeStatus;
    assetById.distribution.distributionNote = distributionNote;

    // ค่าเสื่อม
    assetById.depreciationStartDate = depreciationStartDate;
    assetById.depreciationRegisterDate = depreciationRegisterDate;
    assetById.depreciationReceivedDate = depreciationReceivedDate;
    assetById.depreciationPrice = depreciationPrice;
    assetById.depreciationYearUsed = depreciationYearUsed;
    assetById.depreciationCarcassPrice = depreciationCarcassPrice;
    assetById.depreciationProcess = depreciationProcess;
    assetById.depreciationPresentMonth = depreciationPresentMonth;
    assetById.depreciationCumulativePrice = depreciationCumulativePrice;
    assetById.depreciationYearPrice = depreciationYearPrice;
    assetById.depreciationRemainPrice = depreciationRemainPrice;
    assetById.depreciationBookValue = depreciationBookValue;

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
    assetById.accumulateDepreciationProcess = accumulateDepreciationProcess;
    assetById.accumulateDepreciationPresentMonth =
      accumulateDepreciationPresentMonth;
    assetById.accumulateDepreciationCumulativePrice =
      accumulateDepreciationCumulativePrice;
    assetById.accumulateDepreciationYearPrice = accumulateDepreciationYearPrice;
    assetById.accumulateDepreciationRemainPrice =
      accumulateDepreciationRemainPrice;
    assetById.accumulateDepreciationBookValue = accumulateDepreciationBookValue;

    assetById.reserved = reserved;
    if (status == "saveDraft") {
      const genDataArray = JSON.parse(genDataJSON);
      assetById.genDataArray = genDataArray;
    }
    console.log("assetById", assetById);

    await assetById.save();

    res.status(200).json({ message: "This asset id updated successfully" });
  } catch (err) {
    next(err);
  }
};
