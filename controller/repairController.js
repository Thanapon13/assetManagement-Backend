const Repair = require("../models").repair;
const CostOfRepair = require("../models").costOfRepair;
const CostOfRepairMan = require("../models").costOfRepairMan;
const RepairDocument = require("../models").repairDocument;
const Asset = require("../models").asset;
const PackageAsset = require("../models").pkAsset;
const { ObjectID } = require("bson");
const { query } = require("express");
const { Op } = require("sequelize");
const sequelize = require("sequelize");
const fs = require("fs");
const moment = require("moment/moment");

function delete_file(path) {
  fs.unlink(path, (err) => {
    if (err) throw err;
    console.log(path + " was deleted");
  });
}

exports.createRepair = async (req, res, next) => {
  try {
    const { input } = req.body;
    // console.log("input:", input);

    let {
      informRepairIdDoc,
      urgentStatus,
      informRepairDate,
      assetNumber,
      isInsurance,
      assetGroupNumber,
      hostSector,
      productName,
      insuranceStartDate,
      insuranceEndDate,
      costCenterCode,
      asset01,

      // ข้อมูลสถานที่ซ่อม
      building,
      floor,
      room,
      name_recorder,
      phoneNumber,
      name_courier,
      courierSector,

      // รายละเอียดการซ่อม
      typeOfRepair,
      repairSector,
      problemDetail,
      status,
    } = input;
    console.log("input", input);
    console.log("status", status);

    if (status == "saveDraft") {
      console.log("saveDraft");
      const repair = await Repair.create({
        ...input,
        status: "saveDraft",
      });

      return res.json({ message: "create repair successfully", repair });
    }

    let asset = await Asset.findAll({
      where: { assetNumber },
      attributes: ["_id", "assetNumber"],
    });
    console.log("asset:", asset);

    const packageAssetArray = await PackageAsset.findAll({
      where: { assetNumber: assetNumber },
      attributes: ["_id", "assetNumber"],
      include: [
        { model: Asset, as: "assets", attributes: ["_id", "assetNumber"] },
      ],
    });
    console.log("packageAssetArray", packageAssetArray);

    // const packageAsset = packageAssetArray[0];

    if (asset.length > 0) {
      console.log("true-------------:", asset.length);
      await Asset.update(
        { reserved: true },
        {
          where: {
            assetNumber,
          },
        }
      );
      const repair = await Repair.create({
        ...input,
        status: status,
        statusOfDetailRecord: status,
        assetId: asset[0]._id,
      });

      res.json({ message: "create repair successfully", repair });
    } else if (packageAssetArray) {
      console.log("false-------------:", packageAssetArray);
      await PackageAsset.update(
        { reserved: true },
        {
          where: {
            assetNumber,
          },
        }
      );

      for (el of packageAssetArray.assets) {
        // console.log(el._id)
        await Asset.update({ reserved: true }, { where: { _id: el._id } });
      }

      //   console.log({...input,status: "waiting"})
      console.log("packageAssetArray._id:", packageAssetArray._id);
      const repair = await Repair.create({
        ...input,
        status,
        statusOfDetailRecord: status,
        packageAssetId: packageAssetArray._id,
      });

      res.json({ message: "create repair successfully", repair });
    }
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
    const status = req.query.status || "";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const sector = req.query.sector || "";
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    // console.log(req.query);
    // console.log(moment().endOf("day").toDate())

    // console.log(dateFrom);
    let modifiedDateFrom = "";
    if (dateFrom) {
      const dateFromObj = new Date(dateFrom);
      // dateFromObj.setFullYear(dateFromObj.getFullYear() - 543);
      // dateFromObj.setHours(dateFromObj.getHours() - 7);
      modifiedDateFrom = dateFromObj.toString();
      console.log(modifiedDateFrom);
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

    // if (status !== "") {
    //   if (status === "all") {
    //     query["status"] = {
    //       $in: [
    //         "waiting",
    //         "saveDraft",
    //         "waitingForCheck",
    //         "inProgress",
    //         "complete",
    //         "cancel",
    //       ],
    //     };
    //   } else {
    //     query["status"] = status;
    //   }
    // }
    if (
      status === "all" ||
      status === "" ||
      status === null ||
      status === undefined
    ) {
      queryArray.push({
        status: {
          [Op.in]: [
            "waiting",
            "saveDraft",
            "waitingForCheck",
            "inProgress",
            "complete",
            "cancel",
          ],
        },
      });
    } else {
      queryArray.push({ status: status });
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
      queryArray.push({ courierSector: sector });
    }
    queryArray.push({ deletedAt: { [Op.eq]: null } });
    console.log(queryArray, "queryArray");
    const repair = await Repair.findAll({
      where: { [Op.and]: queryArray },
      // include: [{ model: Asset, require: false, as: "assets" }],
      order: [["updatedAt", "DESC"]],
      offset: page * limit,
      limit: limit,
    });

    // console.log(asset)
    // for show how many pages
    const total = await Repair.count({ where: { [Op.and]: queryArray } });
    res.json({ repair, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getSectorForSearch = async (req, res, next) => {
  try {
    const status = [
      "waiting",
      "inProgress",
      "waitingForCheck",
      "saveDraft",
      "complete",
      "cancel",
    ];
    const courierSector = await Repair.findAll({
      where: {
        [Op.and]: [
          { deletedAt: { [Op.eq]: null } },
          { courierSector: { [Op.ne]: null } },
          { courierSector: { [Op.ne]: "" } },
          { status: { [Op.in]: status } },
        ],
      },
      attributes: [
        // ["_id", "_id"],
        ["courierSector", "courierSector"],
        [
          sequelize.fn("COUNT", sequelize.col("courierSector")),
          "numberOfzipcodes",
        ],
      ],
      group: "courierSector",
      raw: true,
    });

    res.json({ courierSector });
  } catch (err) {
    next(err);
  }
};

exports.getSectorForSearchDetailRecord = async (req, res, next) => {
  try {
    const statusOfDetailRecord = [
      "waiting",
      "waitingRecord",
      "waitingApproval",
      "inProgressOfDetailRecord",
      "completeOfDetailRecord",
      "cancelOfDetailRecord",
      "reject",
    ];
    const courierSector = await Repair.findAll({
      where: {
        [Op.and]: [
          { deletedAt: { [Op.eq]: null } },
          { courierSector: { [Op.ne]: null } },
          { courierSector: { [Op.ne]: "" } },
          { statusOfDetailRecord: { [Op.in]: statusOfDetailRecord } },
        ],
      },
      attributes: [
        // ["_id", "_id"],
        ["courierSector", "courierSector"],
        [
          sequelize.fn("COUNT", sequelize.col("courierSector")),
          "numberOfzipcodes",
        ],
      ],
      group: "courierSector",
      raw: true,
    });

    res.json({ courierSector });
  } catch (err) {
    next(err);
  }
};

exports.getSectorForSearchHistory = async (req, res, next) => {
  try {
    const status = ["complete"];
    const courierSector = await Repair.findAll({
      where: {
        [Op.and]: [
          { deletedAt: { [Op.eq]: null } },
          { courierSector: { [Op.ne]: null } },
          { courierSector: { [Op.ne]: "" } },
          { status: { [Op.in]: status } },
        ],
      },
      attributes: [
        // ["_id", "_id"],
        ["courierSector", "courierSector"],
        [
          sequelize.fn("COUNT", sequelize.col("courierSector")),
          "numberOfzipcodes",
        ],
      ],
      group: "courierSector",
      raw: true,
    });
    res.json({ courierSector });
  } catch (err) {
    next(err);
  }
};

exports.getAllRepair = async (req, res, next) => {
  try {
    const repair = await Repair.findAll({
      include: [
        {
          model: RepairDocument,
          as: "repairDocuments",
          require: false,
        },
        {
          model: CostOfRepair,
          as: "costOfRepairArray",
          require: false,
        },
        {
          model: CostOfRepairMan,
          as: "informRepairManArray",
          require: false,
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
    res.json({ repair });
  } catch (err) {
    next(err);
  }
};

exports.getRepairById = async (req, res, next) => {
  try {
    const RepairId = req.params.repairId;
    const repair = await Repair.findOne({
      where: { _id: RepairId },
      include: [
        {
          model: RepairDocument,
          as: "repairDocuments",
        },
        {
          model: CostOfRepair,
          as: "costOfRepairArray",
        },
        {
          model: CostOfRepairMan,
          as: "informRepairManArray",
        },
      ],
    });
    // const repair = await Repair.aggregate([
    //   { $match: { _id: ObjectID(RepairId) } },
    //   {
    //     $lookup: {
    //       from: "assets",
    //       let: { assetIds: "$assetId" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 { $eq: ["$_id", "$$assetIds"] },
    //                 // { $in: ["$_id", "$$assetIds"] },
    //                 { $not: { $gt: ["$deletedAt", null] } },
    //               ],
    //             },
    //           },
    //         },
    //         {
    //           $project: {
    //             _id: 1,
    //             assetNumber: 1,
    //             productName: 1,
    //             serialNumber: 1,
    //             sector: 1,
    //             imageArray: 1,
    //           },
    //         }, // Specify the fields you want to retrieve
    //       ],
    //       as: "assets",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "packageassets",
    //       let: { packageAssetIds: "$packageAssetId" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 { $eq: ["$_id", "$$packageAssetIds"] },
    //                 { $not: { $gt: ["$deletedAt", null] } },
    //               ],
    //             },
    //           },
    //         },
    //         {
    //           $project: {
    //             _id: 1,
    //             assetNumber: 1,
    //             productName: 1,
    //             serialNumber: 1,
    //             sector: 1,
    //             imageArray: 1,
    //           },
    //         }, // Specify the fields you want to retrieve
    //       ],
    //       as: "packageAssets",
    //     },
    //   },
    // ]);

    res.json({ repair: repair });
  } catch (err) {
    next(err);
  }
};

exports.deleteRepair = async (req, res, next) => {
  try {
    const { repairId } = req.params;
    const { reason } = req.body;
    const repair = await Repair.findByPk(repairId);
    console.log(repair);
    if (repair.status == "saveDraft") {
      await Repair.destroy({ where: { _id: repairId } });
    } else {
      repair.deletedAt = new Date();
      repair.reason = reason;
      await repair.save();

      if (repair.assetId) {
        // for (let i = 0; i < repair.assetIdArray.length; i++) {
        let assetId = repair.assetId;
        // console.log(assetId)
        await Asset.update(
          { reserved: false },
          {
            where: {
              _id: assetId,
            },
          }
        );
        // console.log(asset)
        // }
      }

      if (repair.packageAssetId) {
        // for (let i = 0; i < transfer.packageAssetIdArray.length; i++) {
        let packageAssetId = repair.packageAssetId;
        // console.log(packageAssetId)
        let packageAsset = await PackageAsset.findAll({
          where: { _id: packageAssetId },
          include: [{ model: Asset, as: "assets", attributes: ["_id"] }],
        });
        // let packageAsset = await PackageAsset.aggregate([
        //   { $match: { _id: ObjectID(packageAssetId) } },
        //   {
        //     $lookup: {
        //       from: "assets",
        //       localField: "_id",
        //       foreignField: "packageAssetId",
        //       as: "asset",
        //     },
        //   },
        // ]);

        let findForUpdatePackageAsset = await PackageAsset.update(
          { reserved: false },
          {
            where: {
              _id: packageAssetId,
            },
          }
        );
        console.log("findForUpdatePackageAsset", findForUpdatePackageAsset);

        let assetInPackageArray = packageAsset[0].asset;
        // console.log("assetInPackageArray",i)
        // console.log(assetInPackageArray)
        if (assetInPackageArray.length > 0) {
          for (let j = 0; j < assetInPackageArray.length; j++) {
            // console.log(assetInPackageArray[j]._id)
            await Asset.update(
              { reserved: false },
              {
                where: {
                  _id: assetInPackageArray[j]._id,
                },
              }
            );
          }
        }

        // console.log(packageAsset)
        // }
      }
    }

    res.status(200).json({ message: "delete repair successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.updateRepair = async (req, res, next) => {
  try {
    const repairId = req.params.repairId;
    const { input } = req.body;

    console.log("input", input);

    let {
      informRepairIdDoc,
      urgentStatus,
      informRepairDate,
      assetNumber,
      isInsurance,
      assetGroupNumber,
      hostSector,
      productName,
      insuranceStartDate,
      insuranceEndDate,
      costCenterCode,
      asset01,

      // ข้อมูลสถานที่ซ่อม
      building,
      floor,
      room,
      name_recorder,
      phoneNumber,
      name_courier,
      courierSector,

      // รายละเอียดการซ่อม
      typeOfRepair,
      repairSector,
      problemDetail,

      //สถานะ
      status,
      statusOfDetailRecord,
      statusOutsourceRepair,
    } = input;
    const repairInfo = await Repair.findOne({ where: { _id: repairId } });
    if (
      (repairInfo.status == "saveDraft" && status == "saveDraft") ||
      (repairInfo.assetNumber == assetNumber &&
        status == "waiting" &&
        repairInfo.status == "waiting")
    ) {
      repairInfo.informRepairIdDoc = informRepairIdDoc;
      repairInfo.urgentStatus = urgentStatus;
      repairInfo.informRepairDate = informRepairDate;
      repairInfo.assetNumber = assetNumber;
      repairInfo.isInsurance = isInsurance;
      repairInfo.assetGroupNumber = assetGroupNumber;
      repairInfo.hostSector = hostSector;
      repairInfo.productName = productName;
      repairInfo.insuranceStartDate = insuranceStartDate;
      repairInfo.insuranceEndDate = insuranceEndDate;
      repairInfo.costCenterCode = costCenterCode;
      repairInfo.asset01 = asset01;
      // ข้อมูลสถานที่ซ่อม
      repairInfo.building = building;
      repairInfo.floor = floor;
      repairInfo.room = room;
      repairInfo.name_recorder = name_recorder;
      repairInfo.phoneNumber = phoneNumber;
      repairInfo.name_courier = name_courier;
      repairInfo.courierSector = courierSector;
      // รายละเอียดการซ่อม
      repairInfo.typeOfRepair = typeOfRepair;
      repairInfo.repairSector = repairSector;
      repairInfo.problemDetail = problemDetail;
      //สถานะ
      await repairInfo.save();

      // const borrow = Borrow.create({ ...data })
      return res
        .status(200)
        .json({ message: "This repair id updated successfully" });
    }

    if (repairInfo.status != "saveDraft") {
      const oldAssetNumber = repairInfo.assetNumber;

      if (repairInfo.assetId) {
        await Asset.update(
          { reserved: false },
          { where: { assetNumber: oldAssetNumber } }
        );
      } else if (repairInfo.packageAssetId) {
        const oldAssetPackageAssetArray = await PackageAsset.findAll({
          where: { assetNumber: repairInfo.assetNumber },
          attributes: ["_id", "assetNumber"],
          include: [
            { model: Asset, as: "assets", attributes: ["_id", "assetNumber"] },
          ],
        });
        await PackageAsset.update(
          { reserved: false },
          { where: { assetNumber: oldAssetNumber } }
        );

        for (el of oldAssetPackageAssetArray.assets) {
          // console.log(el._id)
          await Asset.update({ reserved: false }, { where: { _id: el._id } });
        }
      }
    }
    let asset = await Asset.findAll({ where: { assetNumber } });
    console.log(asset);
    const packageAssetArray = await PackageAsset.findAll({
      where: { assetNumber: assetNumber },
      attributes: ["_id", "assetNumber"],
      include: [
        { model: Asset, as: "assets", attributes: ["_id", "assetNumber"] },
      ],
    });
    // const packageAssetArray = await PackageAsset.aggregate([
    //   { $match: { assetNumber } },
    //   {
    //     $lookup: {
    //       from: "assets",
    //       localField: "_id",
    //       foreignField: "packageAssetId",
    //       as: "asset",
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 1,
    //       assetNumber: 1,
    //       "asset._id": 1,
    //     },
    //   },
    // ]);

    const packageAsset = packageAssetArray[0];

    if (asset.length > 0) {
      await Asset.update(
        { reserved: true },
        {
          where: {
            assetNumber,
          },
        }
      );

      const repair = await Repair.update(
        {
          ...input,
          assetId: asset[0]._id,
          packageAssetId: null,
        },
        { where: { _id: repairId } }
      );

      return res.json({ message: "update repair successfully", repair });
    } else if (packageAsset) {
      console;
      await PackageAsset.update(
        { reserved: true },
        {
          where: {
            assetNumber,
          },
        }
      );

      for (el of packageAsset.assets) {
        // console.log(el._id)
        await Asset.update(
          { reserved: true },

          { where: { _id: el._id } }
        );
      }

      //   console.log({...input,status: "waiting"})

      const repair = await Repair.update(
        {
          ...input,
          assetId: null,
          packageAssetId: packageAsset._id,
        },
        { where: { _id: repairId } }
      );

      return res.json({ message: "update repair successfully", repair });
    }
  } catch (err) {
    next(err);
  }
};

// transferApprove page
exports.getBySearchTopRepairApprove = async (req, res, next) => {
  try {
    // for one search but can find in 2 field(serialNumber,productName)
    // const search = req.query.search || "";

    // for 2 field search
    const listStatus =
      req.query.listStatus || "inProgressOfDetailRecord,reject";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const sector = req.query.sector || "";
    // console.log(req.query);
    // console.log(moment().endOf("day").toDate())

    splitList = listStatus?.split(",");
    console.log("splitList", splitList);

    // console.log(dateFrom);
    let modifiedDateFrom = "";
    if (dateFrom) {
      const dateFromObj = new Date(dateFrom);
      // dateFromObj.setFullYear(dateFromObj.getFullYear() + 543);
      // dateFromObj.setHours(dateFromObj.getHours() - 7);
      modifiedDateFrom = dateFromObj.toString();
      console.log(modifiedDateFrom);
    }

    let modifiedDateTo = "";
    if (dateTo) {
      const dateToObj = new Date(dateTo);
      // dateToObj.setFullYear(dateToObj.getFullYear() + 543);
      // dateToObj.setHours(dateToObj.getHours() - 7);
      modifiedDateTo = dateToObj.toString();
      console.log(modifiedDateTo);
    }

    let queryArray = [];

    // if (status !== "") {
    //   if (status === "all") {
    //   } else {
    //     query["status"] = status;
    //   }
    // }

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
      queryArray.push({ courierSector: sector });
    }

    queryArray.push({ deletedAt: { [Op.eq]: null } });
    queryArray.push({ statusOfDetailRecord: { [Op.eq]: "waitingApproval" } });

    console.log(query, "query");
    const topApproveList = await Repair.findAll({
      where: { [Op.and]: queryArray },
      order: [["updatedAt", "DESC"]],
    });
    queryArray.pop();

    queryArray.push({ statusOfDetailRecord: { [Op.in]: splitList } });

    console.log("bottom", queryArray);
    const bottomApproveList = await Repair.findAll({
      where: { [Op.and]: queryArray },
      order: [["updatedAt", "DESC"]],
    });

    // console.log(asset)
    // for show how many pages
    // const total = await Transfer.countDocuments(query);

    // for show how many transfer by status
    const totalWaiting = await Repair.count({
      where: {
        statusOfDetailRecord: "waitingApproval",
        deletedAt: { [Op.eq]: null },
      },
    });
    const totalApprove = await Repair.count({
      where: {
        statusOfDetailRecord: "inProgressOfDetailRecord",
        deletedAt: { [Op.eq]: null },
      },
    });
    const totalReject = await Repair.count({
      where: {
        statusOfDetailRecord: "reject",
        deletedAt: { [Op.eq]: null },
      },
    });
    const totalAll = +totalWaiting + +totalApprove + +totalReject;

    res.json({
      topApproveList,
      bottomApproveList,
      totalAll,
      totalWaiting,
      totalApprove,
      totalReject,
    });
  } catch (err) {
    next(err);
  }
};

exports.getBySearchOfDetailRecord = async (req, res, next) => {
  try {
    // for one search but can find in 2 field(serialNumber,productName)
    // const search = req.query.search || "";

    // for 2 field search
    const typeTextSearch = req.query.typeTextSearch || "";
    const textSearch = req.query.textSearch || "";
    const status = req.query.status || "";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const sector = req.query.sector || "";
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    // console.log(req.query);
    // console.log(moment().endOf("day").toDate())

    // console.log(dateFrom);
    let modifiedDateFrom = "";
    if (dateFrom) {
      const dateFromObj = new Date(dateFrom);
      // dateFromObj.setFullYear(dateFromObj.getFullYear() - 543);
      // dateFromObj.setHours(dateFromObj.getHours() - 7);
      modifiedDateFrom = dateFromObj.toString();
      console.log(modifiedDateFrom);
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
    if (
      status === "all" ||
      status === "" ||
      status === null ||
      status === undefined
    ) {
      queryArray.push({
        statusOfDetailRecord: {
          [Op.in]: [
            "waiting",
            "waitingRecord",
            "waitingApproval",
            "inProgressOfDetailRecord",
            "completeOfDetailRecord",
            "cancelOfDetailRecord",
            "reject",
          ],
        },
      });
    } else {
      queryArray.push({ status: status });
    }
    // if (status !== "") {
    //   if (status === "all") {
    //     query["statusOfDetailRecord"] = {
    //       $in: [
    //         "waiting",
    //         "waitingRecord",
    //         "waitingApproval",
    //         "inProgressOfDetailRecord",
    //         "completeOfDetailRecord",
    //         "cancelOfDetailRecord",
    //         "reject",
    //       ],
    //     };
    //   } else {
    //     query["statusOfDetailRecord"] = status;
    //   }
    // }

    queryArray.push({ status: { [Op.ne]: "saveDraft" } });

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
      queryArray.push({ courierSector: sector });
    }
    queryArray.push({ deletedAt: { [Op.eq]: null } });
    console.log(queryArray, "queryArray");
    const repair = await Repair.findAll({
      where: { [Op.and]: queryArray },
      // include: [{ model: Asset, require: false, as: "assets" }],
      order: [["updatedAt", "DESC"]],
      offset: page * limit,
      limit: limit,
    });

    // console.log(asset)
    // for show how many pages
    const total = await Repair.count({ where: { [Op.and]: queryArray } });

    res.json({ repair, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.recordRepairDetail = async (req, res, next) => {
  try {
    const repairId = req.params.repairId;
    let { input, status, informRepairManArray, costOfRepairArray } = req.body;

    let { repairMan, workDate, arriveAtPlaceDate, repairedDate } = input;
    const oldCostOfRepairMan = await CostOfRepairMan.findAll({
      where: { repairId: repairId },
    });
    const oldCostOfRepair = await CostOfRepair.findAll({
      where: { repairId: repairId },
    });
    if (!status) {
      status = "waitingRecord";
    }
    let notExistArrayCostOfRepairMan = [];
    let notExistArrayCostOfRepair = [];

    function getNotExist(existArray, oldDataArray, notExistArray) {
      const existObjects = existArray.map((obj) => obj._id);

      for (let i = 0; i < oldDataArray.length; i++) {
        if (!existObjects.includes(oldDataArray[i]._id)) {
          notExistArray.push(oldDataArray[i]);
        }
      }

      return notExistArray;
    }
    if (informRepairManArray || oldCostOfRepairMan.length > 0) {
      notExistArrayCostOfRepairMan = getNotExist(
        informRepairManArray,
        oldCostOfRepairMan,
        notExistArrayCostOfRepairMan
      );
    }
    if (costOfRepairArray || oldCostOfRepair.length > 0) {
      notExistArrayCostOfRepair = getNotExist(
        costOfRepairArray,
        oldCostOfRepair,
        notExistArrayCostOfRepair
      );
    }
    console.log("notExistArrayCostOfRepairMan", notExistArrayCostOfRepairMan);
    console.log("notExistArrayCostOfRepair", notExistArrayCostOfRepair);

    if (notExistArrayCostOfRepairMan.length > 0) {
      for (let i = 0; i < notExistArrayCostOfRepairMan.length; i++) {
        await CostOfRepairMan.destroy({
          where: {
            _id: notExistArrayCostOfRepairMan[i]._id,
          },
        });
      }
    }
    if (notExistArrayCostOfRepair.length > 0) {
      for (let i = 0; i < notExistArrayCostOfRepair.length; i++) {
        await CostOfRepair.destroy({
          where: {
            _id: notExistArrayCostOfRepair[i]._id,
          },
        });
      }
    }
    const repair = await Repair.update(
      {
        ...input,
        statusOfDetailRecord: status, // - waitingApproval / - waitingRecord
        // $set: {
        //   informRepairManArray: informRepairManArray,
        //   costOfRepairArray: costOfRepairArray,
        // },
      },
      { where: { _id: repairId } }
    );
    // loop fir create or update notExistArrayCostOfRepairMan
    for (let i = 0; i < informRepairManArray.length; i++) {
      const costOfRepairManInfo = await CostOfRepairMan.findByPk(
        informRepairManArray[i]._id
      );
      if (!costOfRepairManInfo) {
        await CostOfRepairMan.create({
          name: informRepairManArray[i].name,
          workPerHour: informRepairManArray[i].workPerHour,
          ratePerHour: informRepairManArray[i].ratePerHour,
          totalEarn: informRepairManArray[i].totalEarn,
          amountExtra: informRepairManArray[i].amountExtra,
          repairId: repairId,
        });
      } else {
        await CostOfRepairMan.update(
          {
            name: informRepairManArray[i].name,
            workPerHour: informRepairManArray[i].workPerHour,
            ratePerHour: informRepairManArray[i].ratePerHour,
            totalEarn: informRepairManArray[i].totalEarn,
            amountExtra: informRepairManArray[i].amountExtra,
          },
          { where: { _id: informRepairManArray[i]._id } }
        );
      }
    }
    // loop for create update notExistArrayCostOfRepair
    for (let i = 0; i < costOfRepairArray.length; i++) {
      const costOfRepairInfo = await CostOfRepair.findByPk(
        costOfRepairArray[i]._id
      );
      if (!costOfRepairInfo) {
        await CostOfRepair.create({
          stuffName: costOfRepairArray[i].stuffName,
          quantity: costOfRepairArray[i].quantity,
          unit: costOfRepairArray[i].unit,
          pricePerPiece: costOfRepairArray[i].pricePerPiece,
          repairId: repairId,
        });
      } else {
        await CostOfRepair.update(
          {
            tuffName: costOfRepairArray[i].stuffName,
            quantity: costOfRepairArray[i].quantity,
            unit: costOfRepairArray[i].unit,
            pricePerPiece: costOfRepairArray[i].pricePerPiece,
            amountExtra: costOfRepairArray[i].amountExtra,
          },
          { where: { _id: costOfRepairArray[i]._id } }
        );
      }
    }
    res.json({ message: "record detail successfully", repair });
  } catch (err) {
    next(err);
  }
};

exports.updateStatusForGetJobRepair = async (req, res, next) => {
  try {
    const repairId = req.params.repairId;
    const status = req.query.status;
    let query = {};
    if (status) {
      if (status == "waitingRecord") {
        query["status"] = "inProgress";
        query["statusOfDetailRecord"] = "waitingRecord";
        query["assignDate"] = new Date();
      } else if (status == "cancelOfDetailRecord") {
        query["status"] = "cancel";
        query["statusOfDetailRecord"] = "cancelOfDetailRecord";
        const repairData = await Repair.findByPk(repairId);
        console.log("repairData", repairData);
        if (repairData.assetId == null) {
          let packageAssetId = repairData.packageAssetId;
          const packageAssetArray = await PackageAsset.findOne({
            where: { _id: packageAssetId },
            attributes: ["_id", "assetNumber"],
            include: [
              {
                model: Asset,
                as: "assets",
                attributes: ["_id", "assetNumber"],
              },
            ],
          });
          await PackageAsset.update(
            { reserved: false },
            {
              where: {
                assetNumber,
              },
            }
          );

          for (el of packageAssetArray.assets) {
            // console.log(el._id)
            await Asset.update({ reserved: false }, { where: { _id: el._id } });
          }
        } else {
          let assetId = repairData.assetId;

          await Asset.update(
            { reserved: false },
            {
              where: {
                _id: assetId,
              },
            }
          );
        }
      }
    }
    const repair = await Repair.update(query, { where: { _id: repairId } });
    res.json({ message: "update status successfully" });
  } catch (err) {
    next(err);
  }
};

exports.offWorkRepair = async (req, res, next) => {
  try {
    const repairId = req.params.repairId;
    const { input } = req.body;
    const { repairResult, mechinicComment } = input;
    let queryInsert = {};
    const repairData = await Repair.findByPk(repairId);
    if (repairData.outsourceFlag == "Y") {
      queryInsert = { statusOutsourceRepair: "complete" };
    }
    const repair = await Repair.update(
      {
        ...input,
        ...queryInsert,
        status: "waitingForCheck",
        statusOfDetailRecord: "completeOfDetailRecord",
      },
      { where: { _id: repairId }, returning: true, plain: true }
    );

    res.json({ message: "off work successfully" });
  } catch (err) {
    next(err);
  }
};

exports.approveAllWaitingRepair = async (req, res, next) => {
  try {
    const { topApproveList } = req.body;

    for (let i = 0; i < topApproveList.length; i++) {
      if (topApproveList[i].checked == true) {
        let repairId = topApproveList[i]._id;
        let assetId = topApproveList[i].assetId;
        let packageAssetId = topApproveList[i].packageAssetId;
        let queryInsert = {};
        const repairData = await Repair.findByPk(repairId);
        if (repairData.outsourceFlag == "Y") {
          queryInsert = { statusOutsourceRepair: "gotRepair" };
        }
        let repair = await Repair.update(
          {
            ...queryInsert,
            statusOfDetailRecord: "inProgressOfDetailRecord",
            dateTime_approver: new Date(),
          },
          { where: { _id: repairId } }
        );
        if (assetId) {
          // console.log("assetId", assetId);
          let asset = await Asset.update(
            { status: "repair", reserved: false },

            { where: { _id: assetId } }
          );
        }

        if (packageAssetId) {
          // console.log("packageAssetId", packageAssetId);
          let packageAsset = await PackageAsset.update(
            { status: "repair", reserved: false },
            { where: { _id: packageAssetId } }
          );

          // console.log("/n/n");
          // console.log("packageAsset", packageAsset);
          let assetArray = await Asset.findAll({
            where: { packageAssetId: packageAssetId },
          });
          for (let l = 0; l < assetArray.length; l++) {
            let assetId = assetArray[l]._id;
            let asset = await Asset.update(
              { status: "repair", reserved: true },
              { where: { _id: assetId } }
            );
          }
          // console.log("asset",asset)
        }
      }
    }

    res.json({ message: "All repairs have been successfully approved." });
  } catch (err) {
    next(err);
  }
};

exports.rejectAllWaitingRepair = async (req, res, next) => {
  try {
    const { topApproveList } = req.body;

    for (let i = 0; i < topApproveList.length; i++) {
      if (topApproveList[i].checked == true) {
        let repairId = topApproveList[i]._id;
        let assetId = topApproveList[i].assetId;
        let packageAssetId = topApproveList[i].packageAssetId;
        let reason = topApproveList[i].reason;
        let repair = await Repair.update(
          {
            status: "reject",
            statusOfDetailRecord: "reject",
            dateTime_approver: new Date(),
            reason: reason,
          },
          { where: { _id: repairId } }
        );
        if (assetId) {
          // console.log("assetId", assetId);
          let asset = await Asset.update(
            { status: "inStock", reserved: false },
            { where: { _id: assetId } }
          );
        }

        if (packageAssetId) {
          // console.log("packageAssetId", packageAssetId);
          let packageAsset = await PackageAsset.update(
            { status: "inStock", reserved: false },
            { where: { _id: packageAssetId } }
          );

          // console.log("/n/n");
          // console.log("packageAsset", packageAsset);
          let assetArray = await Asset.findAll({ where: { packageAssetId } });
          for (let l = 0; l < assetArray.length; l++) {
            let assetId = assetArray[l]._id;
            let asset = await Asset.update(
              { status: "inStock", reserved: false },
              { where: { _id: assetId } }
            );
          }
          // console.log("asset",asset)
        }
      }
    }

    res.json({ message: "All repairs have been successfully rejected." });
  } catch (err) {
    next(err);
  }
};

exports.rejectIndividualWaitingRepair = async (req, res, next) => {
  try {
    const { topApproveList } = req.body;

    let repairId = topApproveList._id;
    let assetId = topApproveList.assetId;
    let packageAssetId = topApproveList.packageAssetId;
    let reason = topApproveList.reason;

    // console.log("transferId", transferId);
    // console.log("assetIdArray", assetIdArray);
    // console.log("packageAssetIdArray", packageAssetIdArray);

    await Repair.update(
      {
        status: "reject",
        statusOfDetailRecord: "reject",
        dateTime_approver: new Date(),
        reason: reason,
      },
      { where: { _id: repairId } }
    );

    if (assetId) {
      // console.log("assetId", assetId);
      let asset = await Asset.update(
        { status: "inStock", reserved: false },
        { where: { _id: assetId } }
      );
    }

    if (packageAssetId) {
      // console.log("packageAssetId", packageAssetId);
      let packageAsset = await PackageAsset.update(
        { status: "inStock", reserved: false },
        { where: { _id: packageAssetId } }
      );

      let assetArray = await Asset.findAll({
        where: { packageAssetId: packageAssetId },
      });
      for (let l = 0; l < assetArray.length; l++) {
        let assetId = assetArray[l]._id;
        let asset = await Asset.update(
          { status: "inStock", reserved: false },
          { where: { _id: assetId } }
        );
      }
    }
    res.json({ message: "This repair has been successfully rejected." });
  } catch (err) {
    next(err);
  }
};

exports.approveIndividualWaitingRepair = async (req, res, next) => {
  try {
    const { topApproveList } = req.body;
    let repairId = topApproveList._id;
    let assetId = topApproveList.assetId;
    let packageAssetId = topApproveList.packageAssetId;
    let queryInsert = {};
    const repairData = await Repair.findByPk(repairId);
    if (repairData.outsourceFlag == "Y") {
      queryInsert = { statusOutsourceRepair: "gotRepair" };
    }
    await Repair.update(
      {
        ...queryInsert,
        statusOfDetailRecord: "inProgressOfDetailRecord",
        dateTime_approver: new Date(),
      },
      { where: { _id: repairId } }
    );
    if (assetId) {
      // console.log("assetId", assetId);
      let asset = await Asset.update(
        { status: "repair", reserved: true },
        { where: { _id: assetId } }
      );
    }

    if (packageAssetId) {
      // console.log("packageAssetId", packageAssetId);
      let packageAsset = await PackageAsset.update(
        { status: "repair", reserved: true },
        { where: { _id: packageAssetId } }
      );

      // console.log("/n/n");
      // console.log("packageAsset", packageAsset);
      let assetArray = await Asset.findAll({
        where: { packageAssetId: packageAssetId },
      });
      for (let l = 0; l < assetArray.length; l++) {
        let assetId = assetArray[l]._id;
        let asset = await Asset.update(
          { status: "repair", reserved: true },
          { where: { _id: assetId } }
        );
      }
      // console.log("asset",asset)
    }
    res.json({ message: "This repair has been successfully approved." });
  } catch (err) {
    next(err);
  }
};

exports.getBySearchOfHistory = async (req, res, next) => {
  try {
    // for one search but can find in 2 field(serialNumber,productName)
    // const search = req.query.search || "";

    // for 2 field search
    const informRepairIdDocTextSearch =
      req.query.informRepairIdDocTextSearch || "";
    const assetNumberTextSearch = req.query.assetNumberTextSearch || "";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const sector = req.query.sector || "";
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    // console.log(req.query);
    // console.log(moment().endOf("day").toDate())

    // console.log(dateFrom);
    let modifiedDateFrom = "";
    if (dateFrom) {
      const dateFromObj = new Date(dateFrom);
      // dateFromObj.setFullYear(dateFromObj.getFullYear() - 543);
      // dateFromObj.setHours(dateFromObj.getHours() - 7);
      modifiedDateFrom = dateFromObj.toString();
      console.log(modifiedDateFrom);
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

    // if (informRepairIdDocTextSearch !== "") {
    //   query["informRepairIdDoc"] = {
    //     $regex: informRepairIdDocTextSearch,
    //     $options: "i",
    //   };
    // }

    if (informRepairIdDocTextSearch !== "") {
      queryArray.push({
        ["informRepairIdDoc"]: {
          [Op.like]: `%${informRepairIdDocTextSearch}%`,
        },
      });
    }

    // if (assetNumberTextSearch !== "") {
    //   query["assetNumber"] = { $regex: assetNumberTextSearch, $options: "i" };
    // }

    if (assetNumberTextSearch !== "") {
      queryArray.push({
        ["assetNumber"]: { [Op.like]: `%${assetNumberTextSearch}%` },
      });
    }

    queryArray.push({ status: { [Op.eq]: "complete" } });

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
      queryArray.push({ courierSector: sector });
    }

    queryArray.push({ deletedAt: { [Op.eq]: null } });

    console.log(queryArray, "queryArray");
    const repair = await Repair.findAll({
      where: { [Op.and]: queryArray },
      // include: [{ model: Asset, require: false, as: "assets" }],
      order: [["updatedAt", "DESC"]],
      offset: page * limit,
      limit: limit,
    });

    // console.log(asset)
    // for show how many pages
    const total = await Repair.count({ where: { [Op.and]: queryArray } });

    res.json({ repair, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getHistoryThisAssetByAssetNumber = async (req, res, next) => {
  try {
    const assetNumber = req.query.assetNumber;

    let asset = await Asset.findAll({ where: { assetNumber: assetNumber } });

    const packageAssetArray = await PackageAsset.findAll({
      where: { assetNumber: assetNumber },
      attributes: ["_id", "assetNumber"],
      include: [
        { model: Asset, as: "assets", attributes: ["_id", "assetNumber"] },
      ],
    });
    console.log("packageAssetArray", packageAssetArray);
    const packageAsset = packageAssetArray[0];
    let assetInfo = {};
    if (asset.length > 0) {
      assetInfo = asset[0];
      const historyOfasset = await Asset.findAll({
        where: { _id: assetInfo._id },
        include: [
          {
            model: Repair,
            as: "repairAssetId",
            where: { [Op.and]: [{ deletedAt: null }, { status: "complete" }] },
            include: [
              {
                require: false,
                model: CostOfRepair,
                as: "costOfRepairArray",
              },
              {
                require: false,
                model: CostOfRepairMan,
                as: "informRepairManArray",
                attributes: [
                  [
                    sequelize.fn("SUM", sequelize.col("totalEarn")),
                    "totalPrice",
                  ],
                ],
              },
            ],
          },
        ],
      });

      return res.json({ historyOfasset });
    } else if (packageAsset) {
      assetInfo = packageAsset;
      let historyOfasset = await PackageAsset.findAll({
        where: { _id: assetInfo._id },
        // attributes: ["_id"],
        include: [
          {
            model: Repair,
            as: "repairPackageAssetId",
            // attributes: ["_id"],
            where: { [Op.and]: [{ deletedAt: null }, { status: "complete" }] },
            include: [
              {
                require: false,
                model: CostOfRepair,
                as: "costOfRepairArray",
                // attributes: ["_id"],
              },
              {
                require: false,
                model: CostOfRepairMan,
                as: "informRepairManArray",
                // attributes: [
                //   "_id",
                //   [
                //     sequelize.fn("SUM", sequelize.col("totalEarn")),
                //     "totalEarn",
                //   ],
                // ],
              },
            ],
          },
        ],
        // group: [
        //   "TB_PACKAGE_ASSETS._id",
        //   "repairPackageAssetId._id",
        //   "repairPackageAssetId.costOfRepairArray._id",
        //   "repairPackageAssetId.informRepairManArray._id",
        // ],
      });

      // const test = await CostOfRepairMan.findAll({
      //   where: { repairId: 1 },
      //   attributes: [
      //     [sequelize.fn("SUM", sequelize.col("totalEarn")), "totalEarn"],
      //   ],
      // });

      return res.json({ historyOfasset });
    }
  } catch (err) {
    next(err);
  }
};

exports.updateStatusForCheckJobRepair = async (req, res, next) => {
  try {
    const repairId = req.params.repairId;
    const repair = await Repair.findOne({ where: { _id: repairId } });
    const assetId = repair.assetId;
    const packageAssetId = repair.packageAssetId;
    console.log("assetId", assetId);
    console.log("packageAssetId", packageAssetId);

    const repair_update = await Repair.update(
      {
        status: "complete",
      },
      { where: { _id: repairId } }
    );
    if (assetId) {
      await Asset.update(
        { status: "inStock", reserved: false },
        {
          where: {
            _id: assetId,
          },
        }
      );
    } else if (packageAssetId) {
      const packageAssetArray = await PackageAsset.findAll({
        where: { _id: packageAssetId },
        attributes: ["_id", "assetNumber"],
        include: [
          { model: Asset, as: "assets", attributes: ["_id", "assetNumber"] },
        ],
      });

      const packageAsset = packageAssetArray[0];
      await PackageAsset.update(
        { status: "inStock", reserved: false },
        {
          where: {
            _id: packageAssetId,
          },
        }
      );

      for (el of packageAsset.assets) {
        // console.log(el._id)
        await Asset.update(
          { status: "inStock", reserved: false },
          { where: { _id: el._id } }
        );
      }
    }

    res.json({ message: "update status complete successfully" });
  } catch (err) {
    next(err);
  }
};

exports.outSourceRepairRecord = async (req, res, next) => {
  try {
    const repairId = req.params.repairId;
    const { input, status, costOfRepairArray, existArrayDocument } = req.body;
    const arrayDocument = req?.files?.arrayDocument || [];
    let existArrayDocumentArray = [];
    let costOfRepairArrayObject = [];
    existArrayDocumentArray = JSON.parse(existArrayDocument);
    costOfRepairArrayObject = JSON.parse(costOfRepairArray);
    let inputObject = JSON.parse(input);
    const {
      urgentStatus,
      assetNumber,
      building,
      floor,
      room,
      arriveAtPlaceDate,
      workDate,
      repairedDate,
      repairResult,
      statusOutsourceRepair,
      mechinicComment,
      outSourceRepairNumber,
      repairSectorRefNumber,
      repairDateOfCreateOutsourceRepair,
      descriptionOfCreateOutsourceRepair,
      responsibleName,
      approveDate,
      bookNumber,
      approveDateOfDelivery,
      deliverDate,
      contractorName,
      responsibleAddress,
      responsiblePhone,
      price,
      contactName,
      tax,
      responsibleRemark,
      totalPrice,
      checkJobReceiptNumber,
      statusCheckJob,
      approveHireDate,
      checkJobDate,
      hireNumber,
      sendWithDrawMoneyDate,
      receiveWorkOrderDate,
      checkJobInsuranceEndDate,
      checkJobWarrantyPeriod,
      purchaseAmount,
    } = inputObject;
    console.log("inputObject", inputObject);
    console.log("status : ", status);
    let queryInsert = {};
    queryInsert["statusOfDetailRecord"] = status;
    if (status == "waitingApproval") {
      queryInsert["outsourceFlag"] = "Y";
      // queryInsert["dateTime_waitingApprover"] = new Date();
    }
    const repair = await Repair.update(
      {
        ...inputObject,
        ...queryInsert,
      },
      { where: { _id: repairId } }
    );
    // about manage document
    let notExistArrayDocument = [];
    const oldDocumentArray = await RepairDocument.findAll({
      where: { repairId: repairId },
    });
    if (arrayDocument.length > 0) {
      for (el of arrayDocument) {
        await RepairDocument.create({
          document: el.filename,
          repairId: repairId,
        });
      }
    }
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
    if (notExistArrayDocument.length > 0) {
      for (let i = 0; i < notExistArrayDocument.length; i++) {
        await RepairDocument.destroy({
          where: { _id: notExistArrayDocument[i]._id },
        });
        delete_file(`./public/documents/${notExistArrayDocument[i].document}`);
      }
    }

    // about manage CostOfRepair

    const oldCostOfRepair = await CostOfRepair.findAll({
      where: { repairId: repairId },
    });
    let notExistArrayCostOfRepair = [];
    function getNotExist(existArray, oldDataArray, notExistArray) {
      const existObjects = existArray.map((obj) => obj._id);

      for (let i = 0; i < oldDataArray.length; i++) {
        if (!existObjects.includes(oldDataArray[i]._id)) {
          notExistArray.push(oldDataArray[i]);
        }
      }

      return notExistArray;
    }
    if (costOfRepairArrayObject || oldCostOfRepair.length > 0) {
      notExistArrayCostOfRepair = getNotExist(
        costOfRepairArrayObject,
        oldCostOfRepair,
        notExistArrayCostOfRepair
      );
    }

    console.log("notExistArrayCostOfRepair", notExistArrayCostOfRepair);
    if (notExistArrayCostOfRepair.length > 0) {
      for (let i = 0; i < notExistArrayCostOfRepair.length; i++) {
        await CostOfRepair.destroy({
          where: {
            _id: notExistArrayCostOfRepair[i]._id,
          },
        });
      }
    }
    for (let i = 0; i < costOfRepairArrayObject.length; i++) {
      const costOfRepairInfo = await CostOfRepair.findByPk(
        costOfRepairArrayObject[i]._id
      );
      if (!costOfRepairInfo) {
        await CostOfRepair.create({
          stuffName: costOfRepairArrayObject[i].stuffName,
          quantity: costOfRepairArrayObject[i].quantity,
          unit: costOfRepairArrayObject[i].unit,
          pricePerPiece: costOfRepairArrayObject[i].pricePerPiece,
          repairId: repairId,
        });
      } else {
        await CostOfRepair.update(
          {
            stuffName: costOfRepairArrayObject[i].stuffName,
            quantity: costOfRepairArrayObject[i].quantity,
            unit: costOfRepairArrayObject[i].unit,
            pricePerPiece: costOfRepairArrayObject[i].pricePerPiece,
            amountExtra: costOfRepairArrayObject[i].amountExtra,
          },
          { where: { _id: costOfRepairArrayObject[i]._id } }
        );
      }
    }
    res.json({ message: "update outsource repair successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getBySearchOfOutsourceRapair = async (req, res, next) => {
  try {
    // เหลือ ประเภทการซ่อมกับสถานะ
    const informRepairIdDocTextSearch =
      req.query.informRepairIdDocTextSearch || "";
    const outSourceRepairNumberTextSearch =
      req.query.outSourceRepairNumberTextSearch || "";
    const statusOutsourceRepairTextSearch =
      req.query.statusOutsourceRepairTextSearch || "";
    // const status  = req.query.status || "";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    // const sector = req.query.sector || "";
    const building = req.query.building || "";
    const floor = req.query.floor || "";
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    // console.log(req.query);
    // console.log(moment().endOf("day").toDate())

    // console.log(dateFrom);
    let modifiedDateFrom = "";
    if (dateFrom) {
      const dateFromObj = new Date(dateFrom);
      // dateFromObj.setFullYear(dateFromObj.getFullYear() - 543);
      // dateFromObj.setHours(dateFromObj.getHours() - 7);
      modifiedDateFrom = dateFromObj.toString();
      console.log(modifiedDateFrom);
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

    if (informRepairIdDocTextSearch !== "") {
      query["informRepairIdDoc"] = {
        $regex: informRepairIdDocTextSearch,
        $options: "i",
      };
    }
    if (outSourceRepairNumberTextSearch !== "") {
      query["outSourceRepairNumber"] = {
        $regex: outSourceRepairNumberTextSearch,
        $options: "i",
      };
    }
    if (statusOutsourceRepairTextSearch !== "") {
      query["statusOutsourceRepair"] = {
        $regex: statusOutsourceRepairTextSearch,
        $options: "i",
      };
    }
    if (building !== "") {
      queryArray.push({
        building: { [Op.eq]: building },
      });
    }
    if (floor !== "") {
      queryArray.push({
        floor: { [Op.eq]: floor },
      });
    }
    queryArray.push({
      outsourceFlag: { [Op.eq]: "Y" },
    });

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

    queryArray.push({ deletedAt: { [Op.eq]: null } });

    console.log(queryArray, "queryArray");
    const repair = await Repair.findAll({
      where: { [Op.and]: queryArray },
      // include: [{ model: Asset, require: false, as: "assets" }],
      order: [["updatedAt", "DESC"]],
      offset: page * limit,
      limit: limit,
    });

    // console.log(asset)
    // for show how many pages
    const total = await Repair.count({ where: { [Op.and]: queryArray } });

    res.json({ repair, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getAssetNumberSelector = async (req, res, next) => {
  try {
    let listStatus = "inStock,withdrawn,borrowed,transfered,broken";
    // let asset = await Asset.find(query).select("assetNumber"); // sector insuranceStartDate insuranceExpiredDate
    let asset = await Asset.aggregate([
      {
        $match: {
          $and: [{ deletedAt: { $eq: null } }, { assetNumber: { $ne: null } }],
        },
      },
      {
        $group: {
          _id: "$assetNumber",
        },
      },
      {
        $project: {
          assetNumber: "$_id",
          _id: 0,
        },
      },
    ]);

    let pkasset = await PackageAsset.aggregate([
      {
        $match: {
          $and: [{ deletedAt: { $eq: null } }, { assetNumber: { $ne: null } }],
        },
      },
      {
        $group: {
          _id: "$assetNumber",
        },
      },
      {
        $project: {
          assetNumber: "$_id",
          _id: 0,
        },
      },
    ]);
    console.log("asset", asset);
    console.log("pkasset", pkasset);
    let combindArray = [...asset, ...pkasset];
    combindArray.sort((a, b) => a.assetNumber.localeCompare(b.name));
    console.log("combindArray", combindArray);
    res.json({ combindArray });
  } catch (err) {
    next(err);
  }
};

exports.getAssetByAssetNumber = async (req, res, next) => {
  // ขาดรหัส costCenter
  try {
    const assetNumber = req.query.assetNumber;
    let data = await Asset.find({ assetNumber }).select(
      "sector group productName engProductName insuranceStartDate insuranceExpiredDate asset01"
    );
    if (data < 0) {
      data = await PackageAsset.find({ assetNumber }).select(
        "sector group productName engProductName insuranceStartDate insuranceExpiredDate asset01"
      );
    }
    console.log("data", data);

    res.json({ data });
  } catch (err) {
    next(err);
  }
};

exports.getRepairTypeOutsourceForSearchOutsource = async (req, res, next) => {
  try {
    const typeOfRepair = await Repair.findAll({
      where: {
        [Op.and]: [
          { outsourceFlag: { [Op.eq]: "Y" } },
          { deletedAt: { [Op.eq]: null } },
          { typeOfRepair: { [Op.ne]: null } },
          { typeOfRepair: { [Op.ne]: "" } },
        ],
      },
      attributes: [
        // ["_id", "_id"],
        ["typeOfRepair", "typeOfRepair"],
        [
          sequelize.fn("COUNT", sequelize.col("typeOfRepair")),
          "numberOfzipcodes",
        ],
      ],
      group: "typeOfRepair",
      raw: true,
      order: [["typeOfRepair", "ASC"]],
    });
    res.json({ typeOfRepair });
  } catch (err) {
    next(err);
  }
};

exports.getBuildingOutsourceForSearchOutsource = async (req, res, next) => {
  try {
    const building = await Repair.findAll({
      where: {
        [Op.and]: [
          { outsourceFlag: { [Op.eq]: "Y" } },
          { deletedAt: { [Op.eq]: null } },
          { building: { [Op.ne]: null } },
          { building: { [Op.ne]: "" } },
        ],
      },
      attributes: [
        // ["_id", "_id"],
        ["building", "building"],
        [sequelize.fn("COUNT", sequelize.col("building")), "numberOfzipcodes"],
      ],
      group: "building",
      raw: true,
      order: [["building", "ASC"]],
    });

    res.json({ building });
  } catch (err) {
    next(err);
  }
};

exports.getFloorForSearchOutsource = async (req, res, next) => {
  try {
    const floor = await Repair.findAll({
      where: {
        [Op.and]: [
          { outsourceFlag: { [Op.eq]: "Y" } },
          { deletedAt: { [Op.eq]: null } },
          { floor: { [Op.ne]: null } },
          { floor: { [Op.ne]: "" } },
        ],
      },
      attributes: [
        // ["_id", "_id"],
        ["floor", "floor"],
        [sequelize.fn("COUNT", sequelize.col("floor")), "numberOfzipcodes"],
      ],
      group: "floor",
      raw: true,
      order: [["floor", "ASC"]],
    });

    res.json({ floor });
  } catch (err) {
    next(err);
  }
};
