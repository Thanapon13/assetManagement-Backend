const { Sequelize, Op } = require("sequelize");
const {
  transfer,
  subComponentTransfer,
  pkAsset,
  asset,
  transferHasAsset,
  transferHasPkAsset
} = require("../models");
const { json } = require("express");

// หรือใช้การดึงมาทั้ง

exports.createTransfer = async (req, res, next) => {
  try {
    const { input, saveTransferTableArray } = req.body;
    const inputObject = input;
    // console.log("inputObject:", inputObject);

    const saveTransferTableArrayObject = saveTransferTableArray;
    // console.log("saveTransferTableArrayObject", saveTransferTableArrayObject);

    let {
      transferDocumentNumber, // เลขที่เอกสารการโอนย้าย
      transferSector, //หน่วยงานผู้โอน
      subSector, // ภาควิชาที่โอน
      handler,

      transfereeSector, // หน่วยงานผุ้รับโอน
      building, // อาคาร
      floor, // ชั้น
      room, // ห้อง

      name_recorder, // เครื่องบันทึกชื่อ //
      dateTime_recorder,
      name_courier,
      dateTime_courier,
      name_approver, //ผู้อนุมัติชื่อ //
      dateTime_approver, //ผู้อนุมัติวันที่และเวลา //
      status
    } = inputObject;
    // console.log("inputObject:", inputObject);

    // for store in transfer schema
    let assetIdArray = [];
    let packageAssetIdArray = [];

    // for query
    let assetIdHasAssetNumberArray = [];
    let packageAssetIdHasAssetNumberArray = [];
    let transfers;

    let newestTransferDocumentNumber;
    let newestTransfer = await transfer.findOne({
      attributes: ["transferDocumentNumber"],
      order: [["_id", "DESC"]]
    });
    // console.log("newestTransfer:", newestTransfer);

    if (newestTransfer == null) {
      newestTransferDocumentNumber = 0;
    } else {
      newestTransferDocumentNumber = parseInt(
        newestTransfer.transferDocumentNumber
      );
    }

    if (status == "saveDraft") {
      transfers = await transfer.create({
        transferDocumentNumber: newestTransferDocumentNumber + 1,
        transferSector: transferSector,
        subSector: subSector,
        transfereeSector: transfereeSector,
        building: building,
        floor: floor,
        room: room,

        name_recorder: name_recorder,
        dateTime_recorder: new Date(),
        name_courier: name_recorder,
        dateTime_courier: new Date(),
        name_approver: name_approver,
        dateTime_approver: dateTime_approver,
        status: status
      });
      console.log("transfers:", transfers);

      let transfersId = transfers.dataValues._id;
      console.log("transfersId:", transfersId);

      const createSubComponentTransferData = {
        assetNumber: saveTransferTableArrayObject[0].assetNumber,
        isPackage: saveTransferTableArrayObject[0].isPackage,
        productName: saveTransferTableArrayObject[0].productName,
        amount: saveTransferTableArrayObject[0].amount,
        transferId: transfersId
      };

      // console.log(
      //   "createSubComponentTransferData:",
      //   createSubComponentTransferData
      // );

      let subComponentTransfers = await subComponentTransfer.create(
        createSubComponentTransferData
      );
      console.log("subComponentTransfers:", subComponentTransfers);
    } else {
      for (let i = 0; i < saveTransferTableArrayObject.length; i++) {
        // if have specific assetNumber
        if (saveTransferTableArrayObject[i].assetNumber !== "") {
          // console.log(
          //   "assetNumber[i]:",
          //   saveTransferTableArrayObject[i].assetNumber
          // );

          // isPackage === true
          if (saveTransferTableArrayObject[i].isPackage) {
            console.log("isPackage[i]:", saveTransferTableArrayObject[i]);

            let packageAssetData = await pkAsset.findAll({
              where: {
                assetNumber: saveTransferTableArrayObject[i].assetNumber,
                reserved: false,
                status: "inStock"
              },
              include: [
                {
                  model: asset,
                  as: "packageAssets",
                  required: true,
                  attributes: ["_id"]
                }
              ]
            });

            console.log("packageAssetData:", packageAssetData);

            packageAssetIdHasAssetNumberArray.push(packageAssetData);

            console.log(
              "packageAssetIdHasAssetNumberArray:",
              packageAssetIdHasAssetNumberArray
            );

            await pkAsset.update(
              { reserved: true },
              {
                where: {
                  assetNumber: saveTransferTableArrayObject[i].assetNumber
                },
                returnOriginal: false
              }
            );

            const packageAssetId = packageAssetData[0]._id;
            console.log("packageAssetId:", packageAssetId);

            packageAssetIdArray.push({ packageAssetId });
            console.log("packageAssetIdArray:", packageAssetIdArray);

            if (packageAssetData[0].packageAssets.length > 0) {
              for (
                let k = 0;
                k < packageAssetData[0].packageAssets.length;
                k++
              ) {
                let assetId = packageAssetData[0].packageAssets[k]._id;
                console.log("assetId:", assetId);
                let a = await asset.update(
                  { reserved: true },

                  {
                    where: {
                      _id: assetId
                    }
                  }
                );
                console.log("a:", a);
              }
            }
          } else {
            // isPackage === false
            const assetUpdate = await asset.update(
              { reserved: true },
              {
                where: {
                  assetNumber: saveTransferTableArrayObject[i].assetNumber
                },
                returning: true
              }
            );

            console.log("assetUpdate:", assetUpdate);
            console.log(
              "Updated reserved asset value:",
              assetUpdate[1][0].reserved
            );

            assetIdHasAssetNumberArray.push(assetUpdate[1][0]._id);
            console.log(
              "assetIdHasAssetNumberArray:",
              assetIdHasAssetNumberArray
            );

            const assetId = assetUpdate[1][0].dataValues._id;
            console.log("Asset ID:", assetId);

            assetIdArray.push({ assetId });
            console.log("assetIdArray:", assetIdArray);
          }
        } else {
          //  else not have specific assetNumber
          if (saveTransferTableArrayObject[i].isPackage) {
            // isPackage === true
            console.log("isPackage[i]:", saveTransferTableArrayObject[i]);

            let packageAssetData = await pkAsset.findAll({
              where: {
                productName: saveTransferTableArrayObject[i].productName,
                reserved: false,
                status: "inStock",
                _id: {
                  [Op.notIn]: packageAssetIdHasAssetNumberArray
                }
              },
              include: [
                {
                  model: asset,
                  as: "packageAssets",
                  required: true,
                  attributes: ["_id"]
                }
              ],
              limit: +saveTransferTableArrayObject[i].amount
            });
            console.log("packageAssetData:", packageAssetData);

            //  loop packageAsset Array and update all child reserved:true
            for (let j = 0; j < packageAssetData.length; j++) {
              let eachPackageAsset = packageAssetData[j];
              let packageAssetId = eachPackageAsset._id;

              packageAssetIdArray.push({ packageAssetId });
              console.log("packageAssetIdArray:", packageAssetIdArray);

              await pkAsset.update(
                { reserved: true },
                {
                  where: {
                    _id: packageAssetId
                  }
                }
              );

              console.log("packageAssetId:", packageAssetId);

              if (eachPackageAsset.packageAssets.length > 0) {
                for (
                  let k = 0;
                  k < eachPackageAsset.packageAssets.length;
                  k++
                ) {
                  let assetId = eachPackageAsset.packageAssets[k]._id;
                  console.log("assetId", assetId);

                  let assetUpdate = await asset.update(
                    { reserved: true },
                    {
                      where: { _id: assetId },
                      returning: true
                    }
                  );
                  console.log("ASSET UPDATE:", assetUpdate);
                }
              }
            }
          } else {
            // isPackage === false
            console.log("isPackage[i]:", saveTransferTableArrayObject[i]);

            let assetData = await asset.findAll({
              where: {
                productName: saveTransferTableArrayObject[i].productName,
                reserved: false,
                status: "inStock",
                _id: {
                  [Op.notIn]: assetIdHasAssetNumberArray
                }
              },
              limit: +saveTransferTableArrayObject[i].amount
            });
            console.log("ASSET DATA:", assetData);

            for (let j = 0; j < assetData.length; j++) {
              let eachAsset = assetData[j];
              let assetId = eachAsset._id;

              await asset.update(
                { reserved: true },
                {
                  where: {
                    _id: assetId
                  }
                }
              );
              console.log("ASSSET ID:", assetId);
              console.log("eachAsset", eachAsset);
              assetIdArray.push({ assetId });
              console.log("assetIdArray:", assetIdArray);
            }
          }
        }
      }
      console.log("------------------------------------------");
      console.log("assetIdArray", assetIdArray);
      console.log("packageAssetIdArray", packageAssetIdArray);
      console.log("------------------------------------------");

      let transfers = await transfer.create({
        transferDocumentNumber: newestTransferDocumentNumber + 1,
        transferSector: transferSector,
        subSector: subSector,
        transfereeSector: transfereeSector,
        building: building,
        floor: floor,
        room: room,

        name_recorder: name_recorder,
        dateTime_recorder: new Date(),
        name_courier: name_recorder,
        dateTime_courier: new Date(),
        name_approver: name_approver,
        dateTime_approver: dateTime_approver,
        status: status
      });

      console.log("transfers:", transfers);

      let transfersId = transfers.dataValues._id;
      console.log("transfersId:", transfersId);

      for (let i = 0; i < packageAssetIdArray.length; i++) {
        const packageAssetId = packageAssetIdArray[i].packageAssetId;

        const createTransferHasPkAsset = await transferHasPkAsset.create({
          transferId: transfersId,
          packageAssetId: packageAssetId
        });
        console.log("createTransferHasPkAsset:", createTransferHasPkAsset);
      }

      for (let i = 0; i < assetIdArray.length; i++) {
        const assetId = assetIdArray[i].assetId;

        const createTransferHasAsset = await transferHasAsset.create({
          transferId: transfersId,
          assetId: assetId
        });
        console.log("createTransferHasAsset:", createTransferHasAsset);
      }
    }
    res.status(200).json({ message: "Create Transfer sucess" });
  } catch (err) {
    next(err);
  }
};

exports.updateTransfer = async (req, res, next) => {
  try {
    console.log("updateTransfer");
  } catch (err) {
    next(err);
  }
};

exports.deleteTransfer = async (req, res, next) => {
  try {
    const { transferId } = req.params;
    const reason = req.body.reason;

    console.log("-----------------------");
    console.log("transferId:", transferId);
    console.log("reason:", reason);
    console.log("-----------------------");

    const transferData = await transfer.findByPk(transferId, {
      include: [
        { model: transferHasPkAsset, as: "transferHasPkAssets" },
        { model: transferHasAsset, as: "transferHasAssets" }
      ]
    });
    // console.log("transferData:", transferData);

    if (transferData.status == "saveDraft") {
      await transfer.destroy({
        where: {
          _id: transferId
        }
      });
    } else {
      transferData.deletedAt = new Date();
      transferData.reason = reason;
      console.log("transferData.reason:", transferData.reason);
      await transferData.save();

      if (transferData.transferHasAssets) {
        for (let i = 0; i < transferData.transferHasAssets.length; i++) {
          let assetId = transferData.transferHasAssets[i].assetId;
          console.log("assetId:", assetId);
          await asset.update(
            { reserved: false },
            {
              where: {
                _id: assetId
              },
              returning: true
            }
          );
        }
      }

      if (transferData.transferHasPkAssets) {
        for (let i = 0; i < transferData.transferHasPkAssets.length; i++) {
          let packageAssetId =
            transferData.transferHasPkAssets[i].packageAssetId;
          console.log("packageAssetId:", packageAssetId);

          let packageAssetData = await pkAsset.findOne({
            where: {
              _id: packageAssetId
            },
            include: {
              model: asset,
              as: "packageAssets"
            }
          });
          // console.log("packageAssetData:", packageAssetData);

          let findForUpdatePackageAsset = await pkAsset.update(
            { reserved: false },
            {
              where: {
                _id: packageAssetId
              },
              returning: true
            }
          );
          console.log("findForUpdatePackageAsset:", findForUpdatePackageAsset);

          let assetInPackageArray = packageAssetData.packageAssets;
          // console.log("assetInPackageArray:", assetInPackageArray);

          if (assetInPackageArray.length > 0) {
            for (let j = 0; j < assetInPackageArray.length; j++) {
              await asset.update(
                { reserved: false },
                {
                  where: {
                    _id: assetInPackageArray[j].dataValues._id
                  },
                  returning: true
                }
              );
            }
          }
        }
      }
    }

    res.status(200).json({ message: "Deleted success" });
  } catch (error) {
    next(error);
  }
};

// no test postman
exports.getBySearch = async (req, res, next) => {
  try {
    const typeTextSearch = req.query.typeTextSearch || "";
    const textSearch = req.query.textSearch || "";
    const status = req.query.status || "";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const transferSector = req.query.transferSector || "";
    const transfereeSector = req.query.transfereeSector || "";
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;

    let modifiedDateFrom = "";
    if (dateFrom) {
      const dateFromObj = new Date(dateFrom);
      modifiedDateFrom = dateFromObj.toISOString();
    }

    let modifiedDateTo = "";
    if (dateTo) {
      const dateToObj = new Date(dateTo);
      modifiedDateTo = dateToObj.toISOString();
    }

    let whereCondition = {};

    if (textSearch !== "") {
      whereCondition[typeTextSearch] = {
        [Sequelize.Op.iLike]: `%${textSearch}%`
      };
    }

    if (status !== "") {
      if (status === "all") {
      } else {
        whereCondition["status"] = status;
      }
    }

    if (dateFrom !== "") {
      whereCondition["createdAt"] = {
        [Sequelize.Op.gte]: modifiedDateFrom,
        [Sequelize.Op.lte]: Sequelize.literal("CONVERT(date, GETDATE())")
      };
    }
    if (dateTo !== "") {
      whereCondition["createdAt"] = {
        [Sequelize.Op.lte]: modifiedDateTo
      };
    }
    if (dateFrom !== "" && dateTo !== "") {
      whereCondition["createdAt"] = {
        [Sequelize.Op.gte]: modifiedDateFrom,
        [Sequelize.Op.lte]: modifiedDateTo
      };
    }
    if (transferSector !== "") {
      whereCondition["transferSector"] = transferSector;
    }
    if (transfereeSector !== "") {
      whereCondition["transfereeSector"] = transfereeSector;
    }
    whereCondition["deletedAt"] = null;

    console.log(whereCondition, "whereCondition");

    const transfer = await Transfer.findAll({
      where: whereCondition,
      order: [["updatedAt", "DESC"]],
      offset: page * limit,
      limit: limit
    });

    const total = await Transfer.count({
      where: whereCondition
    });

    res.json({ transfer, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getAllTransfer = async (req, res, next) => {
  try {
    const transfers = await transfer.findAll({
      order: [["updatedAt", "DESC"]]
    });
    res.status(200).json({ transfers });
  } catch (err) {
    next(err);
  }
};

// no test postman
exports.getTransferSectorForSearch = async (req, res, next) => {
  try {
    const transferSector = await transfer.findAll({
      attributes: [
        [Sequelize.literal("transferSector"), "transferSector"],
        [
          Sequelize.fn("COUNT", Sequelize.col("transferSector")),
          "numberOfzicodes"
        ]
      ],
      where: {
        deletedAt: null,
        transferSector: {
          [Sequelize.Op.not]: null,
          [Sequelize.Op.not]: ""
        }
      },
      group: ["transferSector"],
      raw: true,
      order: [[Sequelize.literal("transferSector"), "ASC"]]
    });

    res.status(200).json({ transferSector });
  } catch (err) {
    next(err);
  }
};

// ค่านี้ไม่ numberOfzipcodes ต้องแก้
exports.getTransfereeSectorForSearch = async (req, res, next) => {
  try {
    const transfereeSector = await transfer.findAll(
      {
        attributes: ["transfereeSector"]
      },

      "COUNT",
      {
        where: {
          deletedAt: null,
          transfereeSector: {
            [Op.not]: null,
            [Op.not]: ""
          }
        },
        group: ["transfereeSector"],
        attributes: [
          "transfereeSector",
          [
            Sequelize.fn("COUNT", Sequelize.col("transfereeSector")),
            "numberOfzipcodes"
          ]
        ],
        raw: true,
        order: [["transfereeSector", "ASC"]]
      }
    );
    console.log("transfereeSector:", transfereeSector);
    res.status(200).json({ transfereeSector });
  } catch (err) {
    next(err);
  }
};

exports.getBySearchTopTransferApprove = async (req, res, next) => {
  try {
    const { Op } = require("sequelize");

    const listStatus =
      req.query.listStatus || "approve,reject,partiallyApprove";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const transferSector = req.query.transferSector || "";

    const splitList = listStatus?.split(",");

    let modifiedDateFrom = "";
    if (dateFrom) {
      const dateFromObj = new Date(dateFrom);
      modifiedDateFrom = dateFromObj.toISOString();
    }

    let modifiedDateTo = "";
    if (dateTo) {
      const dateToObj = new Date(dateTo);
      modifiedDateTo = dateToObj.toISOString();
    }

    let query = {};

    if (dateFrom !== "") {
      query.createdAt = {
        [Op.gte]: dateFrom,
        [Op.lte]: new Date().toISOString()
      };
    }
    if (dateTo !== "") {
      query.createdAt = {
        [Op.lte]: new Date(dateTo).toISOString()
      };
    }
    if (dateFrom !== "" && dateTo !== "") {
      query.createdAt = {
        [Op.gte]: dateFrom,
        [Op.lte]: dateTo
      };
    }
    if (transferSector !== "") {
      query.transferSector = transferSector;
    }

    query.deletedAt = { [Op.eq]: null };
    query.status = "waiting";

    const topApproveList = await transfer.findAll({
      where: query,
      order: [["updatedAt", "DESC"]]
    });

    query.status = { [Op.in]: splitList };

    const bottomApproveList = await transfer.findAll({
      where: query,
      order: [["dateTime_approver", "DESC"]]
    });

    const totalWaiting = await transfer.count({
      where: { status: "waiting" }
    });
    const totalApprove = await transfer.count({
      where: { status: "approve" }
    });
    const totalReject = await transfer.count({
      where: { status: "reject" }
    });
    const totalAll = totalWaiting + totalApprove + totalReject;

    res.json({
      topApproveList,
      bottomApproveList,
      totalAll,
      totalWaiting,
      totalApprove,
      totalReject
    });
  } catch (err) {
    next(err);
  }
};

exports.approveAllWaitingTransfer = async (req, res, next) => {
  try {
    const { topApproveList } = req.body;
    console.log("topApproveList:", topApproveList);

    for (let i = 0; i < topApproveList.length; i++) {
      if (topApproveList[i].checked) {
        let transferId = topApproveList[i]._id;
        let assetIdArray = topApproveList[i].assetIdArray;
        let packageAssetIdArray = topApproveList[i].packageAssetIdArray;

        let transferData = await transfer.update(
          { status: "approve", dateTime_approver: new Date() },
          {
            where: {
              _id: transferId
            }
          }
        );
        console.log("transferData:", transferData);

        if (assetIdArray.length > 0) {
          for (let j = 0; j < assetIdArray.length; j++) {
            let assetId = assetIdArray[j].assetId;

            let asset = await asset.update(
              { status: "transfered", reserved: false },
              {
                where: {
                  _id: assetId
                }
              }
            );
          }
        }

        if (packageAssetIdArray.length > 0) {
          for (let k = 0; k < packageAssetIdArray.length; k++) {
            let packageAssetId = packageAssetIdArray[k].packageAssetId;

            let packageAsset = await pkAsset.update(
              { status: "transfered", reserved: false },
              {
                where: {
                  _id: packageAssetId
                }
              }
            );
            console.log("packageAsset:", packageAsset);

            let assetArray = await asset.findAll({
              where: {
                packageAssetId
              }
            });

            for (let l = 0; l < assetArray.length; l++) {
              let assetId = assetArray[l]._id;

              let assetData = await asset.update(
                { status: "transfered", reserved: false },
                {
                  where: {
                    _id: assetId
                  }
                }
              );
              console.log("assetData:", assetData);
            }
          }
        }
      }
    }

    res.json({ message: "All transferings have been successfully approved." });
  } catch (err) {
    next(err);
  }
};

// no postman
exports.rejectAllWaitingTransfer = async (req, res, next) => {
  try {
    const { topApproveList } = req.body;
    console.log("topApproveList:", topApproveList);

    for (let i = 0; i < topApproveList.length; i++) {
      if (topApproveList[i].checked) {
        let transferId = topApproveList[i]._id;
        let assetIdArray = topApproveList[i].assetIdArray;
        let packageAssetIdArray = topApproveList[i].packageAssetIdArray;

        await transfer.update(
          {
            status: "reject",
            dateTime_approver: new Date(),
            reason: topApproveList[i].reason,
            assetIdArray,
            packageAssetIdArray
          },
          {
            where: { _id: transferId },
            returning: true
          }
        );

        if (assetIdArray.length > 0) {
          for (let j = 0; j < assetIdArray.length; j++) {
            let assetId = assetIdArray[j].assetId;

            await asset.update(
              { status: "inStock", reserved: false },
              { where: { _id: assetId }, returning: true }
            );
          }
        }

        if (packageAssetIdArray.length > 0) {
          for (let k = 0; k < packageAssetIdArray.length; k++) {
            let packageAssetId = packageAssetIdArray[k].packageAssetId;

            await pkAsset.update(
              { status: "inStock", reserved: false },
              { where: { _id: packageAssetId }, returning: true }
            );

            let assetArray = await asset.findAll({
              where: { packageAssetId },
              returning: true
            });

            for (let l = 0; l < assetArray.length; l++) {
              let assetId = assetArray[l]._id;

              await asset.update(
                { status: "inStock", reserved: false },
                { where: { _id: assetId }, returning: true }
              );
            }
          }
        }
      }
    }

    res.json({ message: "All transferings have been successfully rejected." });
  } catch (err) {
    next(err);
  }
};

// no postman
exports.rejectIndividualWaitingTransfer = async (req, res, next) => {
  try {
    const { topApproveList } = req.body;
    console.log("topApproveList:", topApproveList);

    let transferId = topApproveList._id;
    let assetIdArray = topApproveList.assetIdArray;
    let packageAssetIdArray = topApproveList.packageAssetIdArray;

    await transfer.update(
      {
        status: "reject",
        dateTime_approver: new Date(),
        reason: topApproveList.reason,
        assetIdArray,
        packageAssetIdArray
      },
      {
        where: { _id: transferId },
        returning: true
      }
    );

    if (assetIdArray.length > 0) {
      for (let j = 0; j < assetIdArray.length; j++) {
        let assetId = assetIdArray[j].assetId;

        await asset.update(
          { status: "inStock", reserved: false },
          { where: { _id: assetId }, returning: true }
        );
      }
    }

    if (packageAssetIdArray.length > 0) {
      for (let k = 0; k < packageAssetIdArray.length; k++) {
        let packageAssetId = packageAssetIdArray[k].packageAssetId;

        await pkAsset.update(
          { status: "inStock", reserved: false },
          { where: { _id: packageAssetId }, returning: true }
        );

        let assetArray = await Asset.findAll({
          where: { packageAssetId },
          returning: true
        });

        for (let l = 0; l < assetArray.length; l++) {
          let assetId = assetArray[l]._id;

          await asset.update(
            { status: "inStock", reserved: false },
            { where: { _id: assetId }, returning: true }
          );
        }
      }
    }

    res.json({ message: "This transferings has been successfully rejected." });
  } catch (err) {
    next(err);
  }
};

// no api
exports.partiallyApproveTransferApproveDetail = async (req, res, next) => {
  try {
    console.log("partiallyApproveTransferApproveDetail");
  } catch (err) {
    next(err);
  }
};

//  postman no api body
exports.rejectAllTransferApproveDetail = async (req, res, next) => {
  try {
    const transferId = req.param.transferId;
    const { input } = req.body;

    console.log("input:", input);

    const assetIdArray = input.assetIdArray;
    const packageAssetIdArray = input.packageAssetIdArray;

    console.log("transferId:", transferId);
    console.log("assetIdArray:", assetIdArray);
    console.log("packageAssetIdArray:", packageAssetIdArray);

    await transfer.update(
      {
        status: "reject",
        dateTime_approver: new Date(),
        note: input.note,
        reason: input.reason,
        assetIdArray,
        packageAssetIdArray
      },
      {
        where: { _id: transferId },
        returning: true
      }
    );

    if (assetIdArray.length > 0) {
      for (let j = 0; j < assetIdArray.length; j++) {
        let assetId = assetIdArray[j].assetId;
        console.log("assetId:", assetId);
        await asset.update(
          {
            status: "inStock",
            reserved: false
          },
          {
            where: { _id: assetId },
            returning: true
          }
        );
      }
    }

    if (packageAssetIdArray.length > 0) {
      for (let k = 0; k < packageAssetIdArray.length; k++) {
        let packageAssetId = packageAssetIdArray[k].packageAssetId;

        await pkAsset.update(
          {
            status: "inStock",
            reserved: false
          },
          {
            where: { _id: packageAssetId },
            returning: true
          }
        );

        let assetArray = await asset.findAll({ where: { packageAssetId } });
        for (let l = 0; l < assetArray.length; l++) {
          let assetId = assetArray[l]._id;
          await asset.update(
            {
              status: "inStock",
              reserved: false
            },
            {
              where: { _id: assetId },
              returning: true
            }
          );
        }
      }
    }
    res
      .status(200)
      .json({ message: "This transferings has been successfully rejected." });
  } catch (err) {
    next(err);
  }
};

exports.getViewTransferApproveDetailById = async (req, res, next) => {
  try {
    console.log("getViewTransferApproveDetailById;");
  } catch (err) {
    next(err);
  }
};

exports.getBySearchTransferHistory = async (req, res, next) => {
  try {
    console.log("getBySearchTransferHistory;");
  } catch (err) {
    next(err);
  }
};
