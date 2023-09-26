const { Sequelize, Op } = require("sequelize");
const {
  transfer,
  subComponentTransfer,
  pkAsset,
  asset,
  transferHasAsset,
  transferHasPkAsset,
  assetImage,
  pkAssetImage,
} = require("../models");
const moment = require("moment/moment");

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
      status,
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
      order: [["_id", "DESC"]],
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
        status: status,
      });
      console.log("transfers:", transfers);

      let transfersId = transfers.dataValues._id;
      console.log("transfersId:", transfersId);
      for (let i = 0; i < saveTransferTableArrayObject.length; i++) {
        let subComponentTransfers = await subComponentTransfer.create({
          assetNumber: saveTransferTableArrayObject[i].assetNumber,
          isPackage: saveTransferTableArrayObject[i].isPackage,
          productName: saveTransferTableArrayObject[i].productName,
          amount: saveTransferTableArrayObject[i].amount,
          transferId: transfersId,
        });
      }
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
                status: "inStock",
              },
              include: [
                {
                  model: asset,
                  as: "assets",
                  required: true,
                  attributes: ["_id"],
                },
              ],
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
                  assetNumber: saveTransferTableArrayObject[i].assetNumber,
                },
                returnOriginal: false,
              }
            );

            const packageAssetId = packageAssetData[0]._id;
            console.log("packageAssetId:", packageAssetId);

            packageAssetIdArray.push({ packageAssetId });
            console.log("packageAssetIdArray:", packageAssetIdArray);

            if (packageAssetData[0].assets.length > 0) {
              for (let k = 0; k < packageAssetData[0].assets.length; k++) {
                let assetId = packageAssetData[0].assets[k]._id;
                console.log("assetId:", assetId);
                let a = await asset.update(
                  { reserved: true },

                  {
                    where: {
                      _id: assetId,
                    },
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
                  assetNumber: saveTransferTableArrayObject[i].assetNumber,
                },
                returning: true,
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
                  [Op.notIn]: packageAssetIdHasAssetNumberArray,
                },
              },
              include: [
                {
                  model: asset,
                  as: "packageAssets",
                  required: true,
                  attributes: ["_id"],
                },
              ],
              limit: +saveTransferTableArrayObject[i].amount,
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
                    _id: packageAssetId,
                  },
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
                      returning: true,
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
                  [Op.notIn]: assetIdHasAssetNumberArray,
                },
              },
              limit: +saveTransferTableArrayObject[i].amount,
            });
            console.log("ASSET DATA:", assetData);

            for (let j = 0; j < assetData.length; j++) {
              let eachAsset = assetData[j];
              let assetId = eachAsset._id;

              await asset.update(
                { reserved: true },
                {
                  where: {
                    _id: assetId,
                  },
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
        status: status,
      });

      console.log("transfers:", transfers);

      let transfersId = transfers.dataValues._id;
      console.log("transfersId:", transfersId);

      for (let i = 0; i < packageAssetIdArray.length; i++) {
        const packageAssetId = packageAssetIdArray[i].packageAssetId;

        const createTransferHasPkAsset = await transferHasPkAsset.create({
          transferId: transfersId,
          packageAssetId: packageAssetId,
        });
        console.log("createTransferHasPkAsset:", createTransferHasPkAsset);
      }

      for (let i = 0; i < assetIdArray.length; i++) {
        const assetId = assetIdArray[i].assetId;

        const createTransferHasAsset = await transferHasAsset.create({
          transferId: transfersId,
          assetId: assetId,
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
    const transferId = req.params.transferId;
    const { input, saveTransferTableArray, deleteAssetArray } = req.body;

    console.log("---------------------------------------------------");
    console.log("INPUT:", input);
    console.log("saveTransferTableArray:", saveTransferTableArray);
    console.log("deleteAssetArray:", deleteAssetArray);
    console.log("transferId:", transferId);
    console.log("---------------------------------------------------");

    let {
      transferDocumentNumber,
      transferSector,
      subSector,
      handler,
      transfereeSector,
      building,
      floor,
      room,

      name_recorder,
      dateTime_recorder,
      name_courier,
      dateTime_courier,
      name_approver,
      dateTime_approver,
      status,
    } = input;
    // console.log("input:", input);

    // for store in transfer schema

    //for  query
    let assetIdHasAssetNumberArray = [];
    let packageAssetIdHasAssetNumberArray = [];

    let transferById = await transfer.findOne({ where: { _id: transferId } });
    // console.log("transferById:", transferById);

    if (transferById.status === "saveDraft" && status === "saveDraft") {
      transferById.transferSector = transferSector;
      transferById.subSector = subSector;
      transferById.handler = handler;
      transferById.transfereeSector = transfereeSector;
      transferById.building = building;
      transferById.floor = floor;
      transferById.room = room;
      transferById.name_recorder = name_recorder;
      transferById.name_courier = name_courier;
      await transferById.save();
      await subComponentTransfer.destroy({ where: { transferId: transferId } });
      for (let i = 0; i < saveTransferTableArray.length; i++) {
        await subComponentTransfer.create({
          transferId: transferId,
          assetNumber: saveTransferTableArray[i].assetNumber,
          isPackage: saveTransferTableArray[i].isPackage,
          productName: saveTransferTableArray[i].productName,
          amount: saveTransferTableArray[i].amount,
        });
      }
      return res
        .status(200)
        .json({ message: "This transfer id updated successfully" });
    }

    for (let i = 0; i < saveTransferTableArray.length; i++) {
      if (saveTransferTableArray[i].isFetching === false) {
        // if have specific assetNumber
        if (saveTransferTableArray[i].assetNumber !== "") {
          if (saveTransferTableArray[i].isPackage) {
            console.log("saveTransferTableArray[i]:", saveTransferTableArray);
            let packageAsset = await pkAsset.findAll({
              where: {
                assetNumber: saveTransferTableArray[i].assetNumber,
                // reserved: false
                reserved: false,
                status: "inStock",
              },
              include: [
                {
                  model: asset,
                  as: "assets",
                  required: true,
                  attributes: ["_id"],
                },
              ],
            });
            // console.log("packageAsset:", packageAsset);

            packageAssetIdHasAssetNumberArray.push(packageAsset[0]._id);
            console.log(
              "packageAssetIdHasAssetNumberArray:",
              packageAssetIdHasAssetNumberArray
            );

            await pkAsset.update(
              { reserved: true },
              {
                where: {
                  assetNumber: saveTransferTableArray[i].assetNumber,
                },
                returnOriginal: false,
              }
            );

            const packageAssetId = packageAsset[0]._id;
            console.log("packageAssetId:", packageAssetId);
            transferHasPkAsset.create({
              packageAssetId: packageAssetId,
              transferId: transferId,
            });

            if (packageAsset[0].assets.length > 0) {
              for (let k = 0; k < packageAsset[0].assets.length; k++) {
                let assetId = packageAsset[0].assets[k]._id;
                console.log("assetId:", assetId);
                let a = await asset.update(
                  { reserved: true },

                  {
                    where: {
                      _id: assetId,
                    },
                  }
                );
              }
            }
            // console.log("packageAssetId:", packageAssetId);
          } else {
            // isPackage === false

            const assetUpdate = await asset.update(
              { reserved: true },
              {
                where: {
                  assetNumber: saveTransferTableArray[i].assetNumber,
                },
                returning: true,
              }
            );
            console.log("assetUpdate:", assetUpdate);

            assetIdHasAssetNumberArray.push(assetUpdate[1][0]._id);
            console.log(
              "assetIdHasAssetNumberArray:",
              assetIdHasAssetNumberArray
            );

            const assetId = assetUpdate[1][0]._id;
            console.log("assetId:", assetId);
            if (assetId) {
              await transferHasAsset.create({
                transferId: transferId,
                assetId: assetId,
              });
            }
          }
        } else {
          // else not have specific assetNumber
          if (saveTransferTableArray[i].isPackage) {
            // isPackage === true
            console.log(
              "saveTransferTableArray[i]:",
              saveTransferTableArray[i]
            );

            let packageAssetData = await pkAsset.findAll({
              where: {
                productName: saveTransferTableArray[i].productName,
                reserved: false,
                status: "inStock",
                _id: {
                  [Op.notIn]: packageAssetIdHasAssetNumberArray,
                },
              },
              include: [
                {
                  model: asset,
                  as: "packageAssets",
                  required: true,
                  attributes: ["_id"],
                },
              ],
              limit: +saveTransferTableArray[i].amount,
            });
            // console.log("packageAssetData:", packageAssetData);
            // console.log("packageAssetData.length:", packageAssetData.length);

            // loop packageAsset Array and update all child reserved:true
            for (let j = 0; j < packageAssetData.length; j++) {
              let eachPackageAsset = packageAssetData[j];
              let packageAssetId = eachPackageAsset._id;

              await pkAsset.update(
                { reserved: true },
                {
                  where: {
                    _id: packageAssetId,
                  },
                }
              );
              if (!packageAssetId) {
                await transferHasPkAsset.create({
                  packageAssetId: packageAssetId,
                  transferId: transferId,
                });
              }
              console.log("eachPackageAsset:", eachPackageAsset);

              if (eachPackageAsset.assets.length > 0) {
                for (let k = 0; k < eachPackageAsset.assets.length; k++) {
                  let assetId = eachPackageAsset.assets[k]._id;
                  // console.log("assetId", assetId);

                  let assetUpdate = await asset.update(
                    { reserved: true },
                    {
                      where: { _id: assetId },
                      returning: true,
                    }
                  );
                  console.log("ASSET UPDATE:", assetUpdate);
                }
              }
            }
          } else {
            // isPackage === false

            let assetData = await asset.findAll({
              where: {
                productName: saveTransferTableArray[i].productName,
                reserved: false,
                status: "inStock",
                _id: {
                  [Op.notIn]: assetIdHasAssetNumberArray,
                },
              },
              limit: +saveTransferTableArray[i].amount,
            });
            console.log("ASSET DATA:", assetData);

            for (let j = 0; j < assetData.length; j++) {
              let eachAsset = assetData[j];
              let assetId = eachAsset._id;

              await asset.update(
                { reserved: true },
                {
                  where: {
                    _id: assetId,
                  },
                }
              );
              if (!assetId) {
                await transferHasAsset.create({
                  assetId: assetId,
                  transferId: transferId,
                });
              }
            }
          }
        }
      }
    }

    if (transferById.status != "saveDraft") {
      // for delete assetId or packageAssetId
      for (let i = 0; i < deleteAssetArray?.length; i++) {
        console.log("deleteAssetArray[i]", deleteAssetArray[i]);

        if (deleteAssetArray[i].isPackage) {
          let packageAssetById = await pkAsset.findAll({
            where: {
              assetNumber: deleteAssetArray[i].assetNumber,
              reserved: true,
              status: "inStock",
            },
            include: [
              {
                model: asset,
                as: "assets",
                required: false,
                attributes: ["_id"],
              },
            ],
          });
          console.log("packageAssetById:", packageAssetById);
          // console.log(
          //   "packageAssetById[0].asset:",
          //   packageAssetById[0].packageAssets
          // );
          let assetInPackageAssetArray = packageAssetById[0].assets;
          console.log("assetInPackageAssetArray:", assetInPackageAssetArray);

          let packageAssetId = packageAssetById[0]._id;
          console.log("packageAssetId:", packageAssetId);

          await pkAsset.update(
            { reserved: false },
            {
              where: {
                _id: packageAssetId,
              },
            }
          );

          for (let j = 0; j < assetInPackageAssetArray.length; j++) {
            await asset.update(
              { reserved: false },
              {
                where: {
                  _id: assetInPackageAssetArray[j]._id,
                },
              }
            );

            await transferHasPkAsset.destroy({
              where: { packageAssetId: packageAssetId, transferId: transferId },
            });
          }
        } else {
          let assetById = await asset.findOne({
            where: {
              assetNumber: deleteAssetArray[i].assetNumber,
            },
          });
          console.log("assetById:", assetById);

          let assetId = assetById._id;
          console.log("assetId:", assetId);

          await asset.update(
            { reserved: false },
            {
              where: {
                _id: assetId,
              },
            }
          );

          await transferHasAsset.destroy({
            where: { assetId: assetId, transferId: transferId },
          });
        }
      }
    }

    transferById.transferSector = transferSector;
    transferById.subSector = subSector;
    transferById.handler = handler;
    transferById.transfereeSector = transfereeSector;
    transferById.building = building;
    transferById.floor = floor;
    transferById.room = room;
    transferById.name_recorder = name_recorder;
    transferById.name_courier = name_courier;

    if (transferById.status == "saveDraft" && status == "waiting") {
      transferById.dateTime_recorder = new Date();
      await subComponentTransfer.destroy({ where: { transferId: transferId } });
    }

    transferById.status = status || transferById.status;

    await transferById.save();

    res.status(200).json({ message: "This transfer id updated successfully" });
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
        { model: transferHasAsset, as: "transferHasAssets" },
      ],
    });
    // console.log("transferData:", transferData);

    if (transferData.status == "saveDraft") {
      await transfer.destroy({
        where: {
          _id: transferId,
        },
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
                _id: assetId,
              },
              returning: true,
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
              _id: packageAssetId,
            },
            include: {
              model: asset,
              as: "packageAssets",
            },
          });
          // console.log("packageAssetData:", packageAssetData);

          let findForUpdatePackageAsset = await pkAsset.update(
            { reserved: false },
            {
              where: {
                _id: packageAssetId,
              },
              returning: true,
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
                    _id: assetInPackageArray[j].dataValues._id,
                  },
                  returning: true,
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
        [Op.like]: `%${textSearch}%`,
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
        [Op.gte]: modifiedDateFrom,
        [Op.lte]: Sequelize.literal("CONVERT(date, GETDATE())"),
      };
    }
    if (dateTo !== "") {
      whereCondition["createdAt"] = {
        [Op.lte]: modifiedDateTo,
      };
    }
    if (dateFrom !== "" && dateTo !== "") {
      whereCondition["createdAt"] = {
        [Op.gte]: modifiedDateFrom,
        [Op.lte]: modifiedDateTo,
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

    const transferData = await transfer.findAll({
      where: whereCondition,
      order: [["updatedAt", "DESC"]],
      offset: page * limit,
      limit: limit,
    });

    const total = await transfer.count({
      where: whereCondition,
    });

    res.json({ transferData, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getAllTransfer = async (req, res, next) => {
  try {
    const transfers = await transfer.findAll({
      order: [["updatedAt", "DESC"]],
    });
    res.status(200).json({ transfers });
  } catch (err) {
    next(err);
  }
};

exports.getTransferSectorForSearch = async (req, res, next) => {
  try {
    const transferSector = await transfer.findAll({
      attributes: [
        [Sequelize.literal("transferSector"), "transferSector"],
        [
          Sequelize.fn("COUNT", Sequelize.col("transferSector")),
          "numberOfzicodes",
        ],
      ],
      where: {
        deletedAt: null,
        transferSector: {
          [Op.not]: null,
          [Op.not]: "",
        },
      },
      group: ["transferSector"],
      raw: true,
      order: [[Sequelize.literal("transferSector"), "ASC"]],
    });

    res.status(200).json({ transferSector });
  } catch (err) {
    next(err);
  }
};

exports.getTransferSectorForSearchTransferApprove = async (req, res, next) => {
  try {
    const transferSector = await transfer.findAll({
      attributes: [
        [Sequelize.literal("transferSector"), "transferSector"],
        [
          Sequelize.fn("COUNT", Sequelize.col("transferSector")),
          "numberOfzicodes",
        ],
      ],
      where: {
        deletedAt: null,
        transferSector: {
          [Op.not]: null,
          [Op.not]: "",
        },
        status: "waiting",
      },
      group: ["transferSector"],
      raw: true,
      order: [[Sequelize.literal("transferSector"), "ASC"]],
    });

    res.status(200).json({ transferSector });
  } catch (err) {
    next(err);
  }
};

exports.getTransfereeSectorForSearch = async (req, res, next) => {
  try {
    const transfereeSector = await transfer.findAll(
      {
        attributes: ["transfereeSector"],
      },

      "COUNT",
      {
        where: {
          deletedAt: null,
          transfereeSector: {
            [Op.not]: null,
            [Op.not]: "",
          },
        },
        group: ["transfereeSector"],
        attributes: [
          "transfereeSector",
          [
            Sequelize.fn("COUNT", Sequelize.col("transfereeSector")),
            "numberOfzipcodes",
          ],
        ],
        raw: true,
        order: [["transfereeSector", "ASC"]],
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
    const listStatus =
      req.query.listStatus || "approve,reject,partiallyApprove";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const transferSector = req.query.transferSector || "";

    const splitList = listStatus?.split(",");
    console.log("splitList", splitList);

    let modifiedDateFrom = "";
    if (dateFrom) {
      const dateFromObj = new Date(dateFrom);
      modifiedDateFrom = dateFromObj.toString();
      console.log(modifiedDateFrom);
    }

    let modifiedDateTo = "";
    if (dateTo) {
      const dateToObj = new Date(dateTo);
      modifiedDateTo = dateToObj.toString();
    }

    let query = {};

    if (dateFrom !== "") {
      query["createdAt"] = {
        [Op.gte]: dateFrom,
        [Op.lte]: new Date(),
      };
    }
    if (dateTo !== "") {
      query["createdAt"] = {
        [Op.lte]: new Date(dateTo),
      };
    }
    if (dateFrom !== "" && dateTo !== "") {
      query["createdAt"] = {
        [Op.gte]: dateFrom,
        [Op.lte]: dateTo,
      };
    }
    if (transferSector !== "") {
      query["transferSector"] = transferSector;
    }

    query["deletedAt"] = { [Op.eq]: null };
    query["status"] = "waiting";
    console.log(query, "query");

    const topApproveList = await transfer.findAll({
      where: query,
      order: [["updatedAt", "DESC"]],
      include: [
        {
          model: transferHasAsset,
          as: "transferHasAssets",
          attributes: ["assetId", "reason", "return", "_id"],
        },
        {
          model: transferHasPkAsset,
          as: "transferHasPkAssets",
          attributes: ["packageAssetId", "reason", "return", "_id"],
        },
      ],
    });

    query["status"] = { [Op.in]: splitList };
    console.log("bottom", query);

    const bottomApproveList = await transfer.findAll({
      where: query,
      order: [["dateTime_approver", "DESC"]],
    });

    const totalWaiting = await transfer.count({
      where: { status: "waiting", deletedAt: null },
    });
    const totalApprove = await transfer.count({
      where: { status: "approve", deletedAt: null },
    });
    const totalReject = await transfer.count({
      where: { status: "reject", deletedAt: null },
    });
    const totalAll = totalWaiting + totalApprove + totalReject;

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

exports.approveAllWaitingTransfer = async (req, res, next) => {
  try {
    const { topApproveList } = req.body;
    console.log("topApproveList:", topApproveList);

    for (let i = 0; i < topApproveList.length; i++) {
      if (topApproveList[i].checked) {
        let transferId = topApproveList[i]._id;
        let assetIdArray = topApproveList[i].assetIdArray;
        let packageAssetIdArray = topApproveList[i].packageAssetIdArray;

        console.log("transferId:", transferId);
        console.log("assetIdArray:", assetIdArray);
        console.log("packageAssetIdArray:", packageAssetIdArray);
        let transferData = await transfer.update(
          { status: "approve", dateTime_approver: new Date() },
          {
            where: {
              _id: transferId,
            },
          }
        );
        console.log("transferData:", transferData);

        if (assetIdArray.length > 0) {
          for (let j = 0; j < assetIdArray.length; j++) {
            let assetId = assetIdArray[j].assetId;

            await asset.update(
              { status: "transfered", reserved: false },
              {
                where: {
                  _id: assetId,
                },
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
                  _id: packageAssetId,
                },
              }
            );
            console.log("packageAsset:", packageAsset);

            let assetArray = await asset.findAll({
              where: {
                packageAssetId,
              },
            });

            for (let l = 0; l < assetArray.length; l++) {
              let assetId = assetArray[l]._id;

              let assetData = await asset.update(
                { status: "transfered", reserved: false },
                {
                  where: {
                    _id: assetId,
                  },
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
            packageAssetIdArray,
          },
          {
            where: { _id: transferId },
            returning: true,
          }
        );

        if (assetIdArray.length > 0) {
          for (let j = 0; j < assetIdArray.length; j++) {
            let assetId = assetIdArray[j].assetId;

            await asset.update(
              { status: "inStock", reserved: false },
              { where: { _id: assetId }, returning: true }
            );

            await transferHasAsset.update(
              {
                reason: assetIdArray[i].reason,
                return: assetIdArray[i].return,
              },
              { where: { _id: assetIdArray[i]._id, transferId: transferId } }
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
              returning: true,
            });

            for (let l = 0; l < assetArray.length; l++) {
              let assetId = assetArray[l]._id;

              await asset.update(
                { status: "inStock", reserved: false },
                { where: { _id: assetId }, returning: true }
              );
            }
            await transferHasPkAsset.update(
              {
                reason: packageAssetIdArray[i].reason,
                return: packageAssetIdArray[i].return,
              },
              {
                where: {
                  _id: packageAssetIdArray[i]._id,
                  transferId: transferId,
                },
              }
            );
          }
        }
      }
    }

    res.json({ message: "All transferings have been successfully rejected." });
  } catch (err) {
    next(err);
  }
};

exports.rejectIndividualWaitingTransfer = async (req, res, next) => {
  try {
    const { topApproveList } = req.body;
    console.log("topApproveList:", topApproveList);

    let transferId = topApproveList._id;
    let assetIdArray = topApproveList.transferHasAssets;
    let packageAssetIdArray = topApproveList.transferHasPkAssets;

    console.log("transferId:", transferId);
    console.log("assetIdArray:", assetIdArray);
    console.log("packageAssetIdArray:", packageAssetIdArray);

    await transfer.update(
      {
        status: "reject",
        dateTime_approver: new Date(),
        reason: topApproveList.reason,
        assetIdArray,
        packageAssetIdArray,
      },
      {
        where: { _id: transferId },
        returning: true,
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
          returning: true,
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

exports.partiallyApproveTransferApproveDetail = async (req, res, next) => {
  try {
    const transferId = req.params.transferId;
    const { input } = req.body;
    // console.log("transferId:", transferId);
    console.log("input:", input);

    const assetIdArray = input.assetIdArray;
    const packageAssetIdArray = input.packageAssetIdArray;
    console.log("assetIdArray:", assetIdArray);
    console.log("packageAssetIdArray:", packageAssetIdArray);

    // for check all reason have value
    const assetIdArrayReason = assetIdArray.every(
      (asset) => asset.reason !== "" && asset.reason !== null
    );
    const packageAssetIdArrayReason = packageAssetIdArray.every(
      (asset) => asset.reason !== "" && asset.reason !== null
    );
    const assetIdArrayUnReason = assetIdArray.every(
      (asset) => asset.reason == "" || asset.reason == null
    );
    const packageAssetIdArrayUnReason = packageAssetIdArray.every(
      (asset) => asset.reason == "" || asset.reason == null
    );
    console.log("assetIdArrayReason:", assetIdArrayReason);
    console.log("packageAssetIdArrayReason:", packageAssetIdArrayReason);
    if (assetIdArrayUnReason && packageAssetIdArrayUnReason) {
      // approve all
      await transfer.update(
        {
          status: "approve",
          dateTime_approver: new Date(),
          note: input.note,
        },
        {
          where: {
            _id: transferId,
          },
        }
      );

      for (el of assetIdArray) {
        // reject
        let assetId = el.assetId;
        await asset.update(
          { status: "transfered", reserved: false },
          {
            where: {
              _id: assetId,
            },
          }
        );
        // await transferHasAsset.update(
        //   {
        //     reason: el.reason,
        //     return: el.return,
        //   },
        //   { where: { assetId: assetId, transferId: transferId } }
        // );
      }

      // change all packageAsset status by id
      for (el of packageAssetIdArray) {
        let packageAssetId = el.packageAssetId;

        // reject PackageAsset
        await pkAsset.update(
          { status: "transfered", reserved: false },
          {
            where: {
              _id: packageAssetId,
            },
          }
        );

        let assetArray = await asset.findAll({ where: { packageAssetId } });
        // console.log("assetArray:", assetArray);
        for (let l = 0; l < assetArray.length; l++) {
          let assetId = assetArray[l]._id;
          // reject Asset
          await asset.update(
            { status: "transfered", reserved: false },
            {
              where: {
                _id: assetId,
              },
            }
          );
        }
        // await transferHasPkAsset.update(
        //   {
        //     reason: el.reason,
        //     return: el.return,
        //   },
        //   { where: { packageAssetId: packageAssetId, transferId: transferId } }
        // );
      }
      return res.json({
        message: "This transferings has been successfully approved.",
      });
    }
    if (assetIdArrayReason && packageAssetIdArrayReason) {
      // reject all
      await transfer.update(
        {
          status: "reject",
          dateTime_approver: new Date(),
          note: input.note,
        },
        {
          where: {
            _id: transferId,
          },
        }
      );

      for (el of assetIdArray) {
        // reject
        let assetId = el.assetId;
        await asset.update(
          { status: "inStock", reserved: false },
          {
            where: {
              _id: assetId,
            },
          }
        );
        await transferHasAsset.update(
          {
            reason: el.reason,
            return: el.return,
          },
          { where: { assetId: assetId, transferId: transferId } }
        );
      }

      // change all packageAsset status by id
      for (el of packageAssetIdArray) {
        let packageAssetId = el.packageAssetId;

        // reject PackageAsset
        await pkAsset.update(
          { status: "inStock", reserved: false },
          {
            where: {
              _id: packageAssetId,
            },
          }
        );

        let assetArray = await asset.findAll({ where: { packageAssetId } });
        // console.log("assetArray:", assetArray);
        for (let l = 0; l < assetArray.length; l++) {
          let assetId = assetArray[l]._id;
          // reject Asset
          await asset.update(
            { status: "inStock", reserved: false },
            {
              where: {
                _id: assetId,
              },
            }
          );
        }
        await transferHasPkAsset.update(
          {
            reason: el.reason,
            return: el.return,
          },
          { where: { packageAssetId: packageAssetId, transferId: transferId } }
        );
      }
      return res.json({
        message: "This transferings has been successfully rejected.",
      });
    } else {
      // partially approve or approve
      // check obj in array ,what obj have some value in reason and return to array

      const assetIdReasonIndices = input.assetIdArray
        .map((item, idx) => {
          if (item.reason !== "") {
            return item;
          }
        })
        .filter((item) => item !== undefined);
      console.log("assetIdReasonIndices:", assetIdReasonIndices);

      const packageAssetIdReasonIndices = input.packageAssetIdArray
        .map((item, idx) => {
          if (item.reason !== "") {
            return item;
          }
        })
        .filter((item) => item !== undefined);

      console.log("packageAssetIdReasonIndices:", packageAssetIdReasonIndices);
      if (
        assetIdReasonIndices.length > 0 ||
        packageAssetIdReasonIndices.length > 0
      ) {
        // partially approve
        // console.log("assetIdReasonIndices:", assetIdReasonIndices);
        // console.log(
        //   "packageAssetIdReasonIndices:",
        //   packageAssetIdReasonIndices
        // );
        await transfer.update(
          {
            status: "partiallyApprove",
            dateTime_approver: new Date(),
            note: input.note,
            assetIdArray,
            packageAssetIdArray,
          },
          {
            where: {
              _id: transferId,
            },
            returning: true,
          }
        );

        // change all asset status by id
        for (el of assetIdArray) {
          let assetId = el.assetId;
          let reason = el.reason;
          console.log("assetId:", assetId);
          console.log("reason:", reason);

          if (reason !== "") {
            // reject
            await asset.update(
              { status: "inStock", reserved: false },
              {
                where: {
                  _id: assetId,
                },
              },
              {
                returnOriginal: false,
              }
            );
            await transferHasAsset.update(
              {
                reason: reason,
              },
              { where: { assetId: assetId, transferId: transferId } }
            );
          } else {
            // approve
            await asset.update(
              { status: "transfered", reserved: false },
              {
                where: {
                  _id: assetId,
                },
              },
              {
                returnOriginal: false,
              }
            );
          }
        }
        for (el of packageAssetIdArray) {
          let packageAssetId = el.packageAssetId;
          let reason = el.reason;
          console.log("packageAssetId:", packageAssetId);
          console.log("reason:", reason);

          if (reason !== "") {
            // reject
            await pkAsset.update(
              { status: "inStock", reserved: false },
              {
                where: {
                  _id: packageAssetId,
                },
              },
              {
                returnOriginal: false,
              }
            );
            let assetArray = await asset.findAll({ where: { packageAssetId } });
            // console.log("assetArray:", assetArray);
            for (let l = 0; l < assetArray.length; l++) {
              let assetId = assetArray[l]._id;
              // reject Asset
              await asset.update(
                { status: "inStock", reserved: false },
                {
                  where: {
                    _id: assetId,
                  },
                }
              );
            }
            await transferHasPkAsset.update(
              {
                reason: reason,
              },
              {
                where: {
                  packageAssetId: packageAssetId,
                  transferId: transferId,
                },
              }
            );
          } else {
            // approve
            await pkAsset.update(
              { status: "transfered", reserved: false },
              {
                where: {
                  _id: packageAssetId,
                },
              },
              {
                returnOriginal: false,
              }
            );
            let assetArray = await asset.findAll({ where: { packageAssetId } });
            // console.log("assetArray:", assetArray);
            for (let l = 0; l < assetArray.length; l++) {
              let assetId = assetArray[l]._id;
              // reject Asset
              await asset.update(
                { status: "transfered", reserved: false },
                {
                  where: {
                    _id: assetId,
                  },
                }
              );
            }
          }
        }
      }
    }
    res
      .status(200)
      .json({ message: "partiallyApproveTransferApproveDetail successfully" });
  } catch (err) {
    next(err);
  }
};

exports.rejectAllTransferApproveDetail = async (req, res, next) => {
  try {
    const transferId = req.params.transferId;
    const { input } = req.body;
    console.log("transferId:", transferId);
    console.log("input:", input);

    const assetIdArray = input[0].assetIdArray;
    const packageAssetIdArray = input[0].packageAssetIdArray;
    console.log("assetIdArray:", assetIdArray);
    console.log("packageAssetIdArray:", packageAssetIdArray);

    await transfer.update(
      {
        status: "reject",
        dateTime_approver: new Date(),
        note: input.note,
        reason: input.reason,
        assetIdArray,
        packageAssetIdArray,
      },
      {
        where: { _id: transferId },
        returning: true,
      }
    );

    if (assetIdArray.length > 0) {
      for (let j = 0; j < assetIdArray.length; j++) {
        let assetId = assetIdArray[j]._id;
        console.log("assetId:", assetId);
        await asset.update(
          {
            status: "inStock",
            reserved: false,
          },
          {
            where: { _id: assetId },
            returning: true,
          }
        );
      }
    }

    if (packageAssetIdArray.length > 0) {
      console.log("packageAssetIdArray:", packageAssetIdArray);
      for (let k = 0; k < packageAssetIdArray.length; k++) {
        let packageAssetId = packageAssetIdArray[k]._id;
        console.log("packageAssetId:", packageAssetId);

        await pkAsset.update(
          {
            status: "inStock",
            reserved: false,
          },
          {
            where: { _id: packageAssetId },
            returning: true,
          }
        );

        let assetArray = await asset.findAll({ where: { packageAssetId } });
        console.log("assetArray:", assetArray);
        for (let l = 0; l < assetArray.length; l++) {
          let assetId = assetArray[l]._id;
          await asset.update(
            {
              status: "inStock",
              reserved: false,
            },
            {
              where: { _id: assetId },
              returning: true,
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
    const transferId = req.params.transferId;
    console.log("transferId:", transferId);

    const transferArray = await transfer.findOne({
      where: { _id: transferId },
      include: [
        {
          model: transferHasAsset,
          as: "transferHasAssets",
          required: false,
          include: [
            {
              model: asset,
              as: "TB_ASSET",
              include: [
                {
                  model: assetImage,
                  as: "assetImages",
                },
              ],
            },
          ],
        },
        {
          model: transferHasPkAsset,
          required: false,
          as: "transferHasPkAssets",
          include: [
            {
              model: pkAsset,
              as: "TB_PACKAGE_ASSET",
              include: [
                {
                  model: pkAssetImage,
                  as: "packageAssetImages",
                },
              ],
            },
          ],
        },
      ],
    });
    if (transferArray == 0) {
      return res.status(404).json({ message: "This transfer not found" });
    }
    const approveArray = [];
    const rejectArray = [];

    transferArray.transferHasAssets.forEach((asset) => {
      if (asset.reason !== "") {
        rejectArray.push(asset);
      } else {
        approveArray.push(asset);
      }
    });

    transferArray.transferHasPkAssets.forEach((packageAsset) => {
      if (packageAsset.reason !== "") {
        rejectArray.push(packageAsset);
      } else {
        approveArray.push(packageAsset);
      }
    });
    res.json({ transferArray, approveArray, rejectArray });
  } catch (err) {
    next(err);
  }
};

exports.getBySearchTransferHistory = async (req, res, next) => {
  try {
    const typeTextSearch = req.query.typeTextSearch || "";
    const textSearch = req.query.textSearch || "";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const status = req.query.status || "";
    const transfereeSector = req.query.transfereeSector || "";
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;

    let modifiedDateFrom = "";
    if (dateFrom) {
      modifiedDateFrom = moment(dateFrom).format("YYYY-MM-DD");
      console.log(modifiedDateFrom);
    }

    let modifiedDateTo = "";
    if (dateTo) {
      modifiedDateTo = moment(dateTo).format("YYYY-MM-DD");
    }

    // let query = {
    //   where: {
    //     deletedAt: null,
    //     status: status || {
    //       [Op.in]: [
    //         "approve",
    //         "partiallyApprove",
    //         "waitingReturnApprove",
    //         "partiallyReturn",
    //         "done"
    //       ]
    //     }
    //   },
    //   order: [["dateTime_approver", "DESC"]],
    //   offset: page * limit,
    //   limit
    // };
    let queryArray = [];
    let queryAssetNumber = {};
    let idArray = [];

    if (textSearch !== "") {
      if (typeTextSearch === "assetNumber") {
        let assetArray = await asset.findAll({
          where: {
            assetNumber: { [Op.like]: `%${textSearch}%` },
          },
        });
        console.log("assetArray", assetArray);
        let packageAssetArray = await pkAsset.findAll({
          where: {
            assetNumber: { [Op.like]: `%${textSearch}%` },
          },
        });
        console.log("packageAssetArray", packageAssetArray);

        idArray = assetArray
          .concat(packageAssetArray)
          .map((asset) => asset._id);
        queryAssetNumber = {
          [Op.or]: [
            {
              "$transferHasAssets.assetId$": {
                [Op.in]: idArray,
              },
            },
            {
              "$transferHasPkAssets.packageAssetId$": {
                [Op.in]: idArray,
              },
            },
          ],
        };
      } else {
        queryArray.push({
          [typeTextSearch]: { [Op.like]: `%${textSearch}%` },
        });
      }
    }
    if (transfereeSector !== "") {
      queryArray.push({
        transfereeSector: {
          [Op.eq]: transfereeSector,
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

    if (status !== "") {
      queryArray.push({ status: status });
    } else {
      queryArray.push({
        status: {
          [Op.in]: [
            "approve",
            "partiallyApprove",
            "waitingReturnApprove",
            "partiallyReturn",
            "done",
          ],
        },
      });
    }

    queryArray.push({ deletedAt: { [Op.eq]: null } });

    const transferData = await transfer.findAll({
      where: {
        [Op.and]: queryArray,
        ...queryAssetNumber,
      },
      include: [
        {
          model: transferHasAsset,
          as: "transferHasAssets",
          // require: true,
        },
        {
          model: transferHasPkAsset,
          as: "transferHasPkAssets",
          // require: true,
        },
      ],

      order: [["updatedAt", "DESC"]],
      offset: page * limit,
      // limit: limit,
    });
    const total = await transfer.count({
      where: {
        [Op.and]: queryArray,
        ...queryAssetNumber,
      },
      include: [
        {
          model: transferHasAsset,
          as: "transferHasAssets",
          // require: true,
        },
        {
          model: transferHasPkAsset,
          as: "transferHasPkAssets",
          // require: true,
        },
      ],
    });

    res.json({ transferData, idArray, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getTransferHistorySector = async (req, res, next) => {
  try {
    const transfereeSectors = await transfer.findAll({
      attributes: ["transfereeSector"],
      where: {
        transfereeSector: { [Op.ne]: null },
        status: {
          [Op.in]: [
            "approve",
            "partiallyApprove",
            "waitingReturnApprove",
            "partiallyReturn",
            "done",
          ],
        },
        deletedAt: null,
      },
      group: ["transfereeSector"],
      order: [["transfereeSector", "ASC"]],
    });

    console.log("transfereeSectors:", transfereeSectors);

    res.status(200).json({ transfereeSectors });
  } catch (err) {
    next(err);
  }
};

// exports.getTransferById = async (req, res, next) => {
//   try {
//     const transferId = req.params.transferId;
//     console.log("transferId:", transferId);

//     const transferById = await transfer.findOne({
//       where: { _id: transferId },
//       include: [
//         {
//           model: transferHasAsset,
//           as: "transferHasAssets",
//           include: [
//             {
//               model: asset,
//               as: "TB_ASSET",
//               where: { deletedAt: null },
//               attributes: [
//                 "_id",
//                 "assetNumber",
//                 "productName",
//                 "serialNumber",
//                 "sector"
//                 // "imageArray"
//               ],
//               include: [
//                 {
//                   model: assetImage,
//                   as: "assetImages",
//                   attributes: ["image"]
//                 }
//               ]
//             }
//           ]
//         },
//         {
//           model: transferHasPkAsset,
//           as: "transferHasPkAssets",
//           include: [
//             {
//               model: pkAsset,
//               as: "TB_PACKAGE_ASSET",
//               where: { deletedAt: null },
//               attributes: [
//                 "_id",
//                 "assetNumber",
//                 "productName",
//                 // "serialNumber",
//                 "sector"
//                 // "imageArray"
//               ]
//             }
//           ]
//         },
//         {
//           model: subComponentTransfer,
//           as: "subComponentTransfers",
//           require: false
//         }
//       ]
//     });

//     res.status(200).json({ transferById });
//   } catch (err) {
//     next(err);
//   }
// };

exports.getTransferById = async (req, res, next) => {
  try {
    const transferId = req.params.transferId;
    console.log("transferId:", transferId);

    const transferById = await transfer.findOne({
      where: { _id: transferId },
      include: [
        {
          model: transferHasAsset,
          as: "transferHasAssets",
          include: [
            {
              model: asset,
              as: "TB_ASSET",
              where: { deletedAt: null },
              attributes: [
                "_id",
                "assetNumber",
                "productName",
                "serialNumber",
                "sector",
              ],
              include: [
                {
                  model: assetImage,
                  as: "assetImages",
                  attributes: ["image"],
                },
              ],
            },
          ],
        },
        {
          model: transferHasPkAsset,
          as: "transferHasPkAssets",
          include: [
            {
              model: pkAsset,
              as: "TB_PACKAGE_ASSET",
              where: { deletedAt: null },
              attributes: [
                "_id",
                "assetNumber",
                "productName",
                "serialNumber",
                "sector",
              ],
              include: [
                {
                  model: pkAssetImage,
                  as: "packageAssetImages",
                  attributes: ["image"],
                },
              ],
            },
          ],
        },
        {
          model: subComponentTransfer,
          as: "subComponentTransfers",
          require: false,
        },
      ],
    });
    if (transferById == null) {
      return res.status(404).json({ message: "this transfer not found" });
    }

    if (transferById && transferById.subComponentTransfers) {
      for (const subComponentTransfers of transferById.subComponentTransfers) {
        if (subComponentTransfers.isPackage == false) {
          const assets = await asset.findOne({
            where: { assetNumber: subComponentTransfers.assetNumber },
            attributes: [
              "_id",
              "serialNumber",
              "brand",
              "unit",
              "pricePerUnit",
              "sector",
            ],
            include: [
              {
                model: assetImage,
                as: "assetImages",
              },
            ],
          });
          subComponentTransfers.setDataValue("assets", assets);
        } else {
          const assets = await pkAsset.findOne({
            where: { assetNumber: subComponentTransfers.assetNumber },
            attributes: [
              "_id",
              "serialNumber",
              "brand",
              "unit",
              "pricePerUnit",
            ],
            include: [
              {
                model: pkAssetImage,
                as: "packageAssetImages",
              },
            ],
          });
          subComponentTransfers.setDataValue("assets", assets);
        }
      }
    }
    res.status(200).json({ transferById });
  } catch (err) {
    next(err);
  }
};
