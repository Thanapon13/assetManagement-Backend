const { Sequelize, Op } = require("sequelize");
const {
  transfer,
  subComponentTransfer,
  pkAsset,
  asset,
  sequelize
} = require("../models");

// หรือใช้การดึงมาทั้ง

exports.createTransfer = async (req, res, next) => {
  try {
    const { input, saveTransferTableArray } = req.body;
    const inputObject = input;
    // console.log("inputObject:", inputObject);

    const saveTransferTableArrayObject = saveTransferTableArray;
    console.log("saveTransferTableArrayObject", saveTransferTableArrayObject);

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
          // isPackage === true
          if (saveTransferTableArrayObject[i].isPackage === true) {
            console.log("----------------------");
            console.log(
              "assetNumber[I]:",
              saveTransferTableArrayObject[i].assetNumber
            );
            console.log("index I", i);
            console.log("----------------------");

            // ตั้งแต่นี้ยังไม่ได้ test postman
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
                  where: {
                    packageAssetId: Sequelize.col("TB_PACKAGE_ASSETS._id")
                  },
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
          }
        }
      }
    }
    res.status(200).json({ transfer });
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
    const { reason } = req.body;

    const transferData = await transfer.findByPk(transferId);

    if (transferData.status == "saveDraft") {
      await transfer.destroy({
        where: {
          _id: transferId
        }
      });
    } else {
      transferData.deletedAt = new Date();
      transferData.reason = reason;
      await transferData.save();

      if (transferData.assetIdArray) {
        for (let i = 0; i < transferData.assetIdArray.length; i++) {
          let assetId = transferData.assetIdArray[i].assetId;

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

      if (transferData.packageAssetIdArray) {
        for (let i = 0; i < transferData.packageAssetIdArray.length; i++) {
          let packageAssetId =
            transferData.packageAssetIdArray[i].packageAssetId;

          let packageAsset = await pkAsset.findOne({
            where: {
              _id: packageAssetId
            },
            include: {
              model: asset,
              as: "packageAssets"
            }
          });

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

          let assetInPackageArray = packageAsset.asset;

          if (assetInPackageArray.length > 0) {
            for (let j = 0; j < assetInPackageArray.length; j++) {
              await asset.update(
                { reserved: false },
                {
                  where: {
                    _id: assetInPackageArray[j]._id
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

exports.getBySearch = async (req, res, next) => {
  try {
    console.log("getBySearch");
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
