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
          if (saveTransferTableArrayObject[i].isPackage) {
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
              attributes: [],
              include: {
                model: asset,
                as: "packageAssets",
                attributes: ["_id"],
                where: sequelize.literal(
                  "`asset`.`packageAssetId` = `PackageAsset`.`_id`"
                )
              },
              raw: true
            });
            console.log("packageAssetData:", packageAssetData);

            // packageAssetIdHasAssetNumberArray.push(packageAssetData);

            // packageAssetIdHasAssetNumberArray.push(
            //   packageAssetData[0]._id.toString()
            // );

            // await pkAsset.update(
            //   {
            //     assetNumber: saveTransferTableArrayObject[i].assetNumber
            //   },
            //   { reserved: true },
            //   {
            //     returnOriginal: false
            //   }
            // );

            // const packageAssetId = packageAssetData[0]._id;
            // packageAssetIdArray.push({ packageAssetId });

            // if (packageAssetData[0].asset.length > 0) {
            //   for (let k = 0; k < packageAssetData[0].asset.length; k++) {
            //     let assetId = packageAssetData[0].asset[k]._id;
            //     console.log("assetId", assetId);
            //     let a = await asset.update(
            //       {
            //         _id: assetId
            //       },
            //       { reserved: true }
            //     );
            //     console.log("a:", a);
            //     console.log("asset:", asset);
            //   }
            // }
            // console.log("packageAssetId:", packageAssetId);
          }
          // else {
          //   const assetUpdate = await asset.update(
          //     { reserved: true },
          //     {
          //       where: {
          //         assetNumber: saveTransferTableArrayObject[i].assetNumber
          //       },
          //       returning: true
          //     }
          //   );
          //   console.log("assetUpdate:", 136);
          //   assetIdHasAssetNumberArray.push(assetUpdate._id);
          //   console.log("assetUpdate:", assetUpdate);
          //   const assetId = assetUpdate._id;
          //   assetIdArray.push({ assetId });
          //   console.log("assetId:".assetId);
          //   // assetIdHasAssetNumberArray.push(assetUpdate[1][0]._id.toString());
          //   // assetIdArray.push({ assetId: assetUpdate[1][0]._id.toString() });
          // }
        }

        // else {
        //   //  else not have specific assetNumber
        //   if (saveTransferTableArrayObject[i].isPackage) {
        //     // isPackage === true

        //     // console.log(
        //     //   "saveTransferTableArrayObject[i].isPackage):",
        //     //   saveTransferTableArrayObject[i].isPackage
        //     // );

        //     let packageAssetData = await pkAsset.findAll({
        //       where: {
        //         productName: saveTransferTableArrayObject[i].productName,
        //         reserved: false,
        //         status: "inStock",
        //         _id: {
        //           [Op.notIn]: packageAssetIdHasAssetNumberArray
        //         }
        //       },
        //       attributes: [],
        //       include: {
        //         model: asset,
        //         as: "packageAssets",
        //         attributes: ["_id"],
        //         where: sequelize.literal(
        //           "`asset`.`packageAssetId` = `PackageAsset`.`_id`"
        //         )
        //       },
        //       limit: +saveTransferTableArrayObject[i].amount,
        //       raw: true
        //     });
        //     console.log("packageAssetData:", packageAssetData);
        //     console.log("packageAssetData.lenght:", packageAssetData.length);

        //     // loop packageAsset Array and update all child reserved:true
        //     for (let j = 0; j < packageAssetData.length; j++) {
        //       let eachPackageAsset = packageAssetData[j];
        //       let packageAssetId = eachPackageAsset._id;
        //       // let packageAssetId = eachPackageAsset._id.toString();

        //       // packageAssetIdArray.push({ packageAssetId });

        //       await pkAsset.update(
        //         { reserved: true },
        //         {
        //           where: {
        //             _id: packageAssetId
        //           }
        //         }
        //       );

        //       console.log("packageAssetId:", packageAssetId);
        //       // console.log(pkAsset[j].asset
        //       packageAssetIdArray.push({ packageAssetId });

        //       if (eachPackageAsset.asset.length > 0) {
        //         for (let k = 0; k < eachPackageAsset.asset.length; k++) {
        //           // console.log(assetId)
        //           let assetId = eachPackageAsset.asset[k]._id;
        //           // let assetId = eachPackageAsset.asset[k]._id.toString();

        //           console.log("assetId:", assetId);
        //           let a = await asset.update(
        //             { reserved: true },
        //             {
        //               where: {
        //                 _id: assetId
        //               }
        //             }
        //           );
        //           console.log("a:", a);
        //           // console.log(asset)
        //         }
        //       }
        //     }
        //     // console.log(pkAsset.asset);
        //     // console.log(packageAssetId);
        //   } else {
        //     // isPackage === false
        //     // console.log(
        //     //   "assetIdHasAssetNumberArray",
        //     //   assetIdHasAssetNumberArray
        //     // );

        //     let assetData = await asset.findAll({
        //       where: {
        //         productName: saveTransferTableArrayObject[i].productName,
        //         reserved: false,
        //         status: "inStock",
        //         _id: {
        //           [Op.notIn]: assetIdHasAssetNumberArray
        //         }
        //       },
        //       limit: +saveTransferTableArrayObject[i].amount
        //     });
        //     console.log("assetData:", assetData);

        //     for (let j = 0; j < asset.length; j++) {
        //       let eachAsset = asset[j];
        //       let assetId = eachAsset._id;

        //       await asset.update(
        //         { reserved: true },
        //         {
        //           where: {
        //             _id: assetId
        //           }
        //         }
        //       );

        //       assetIdArray.push({ assetId });
        //       // console.log("eachAsset",eachAsset)
        //     }
        //   }
        // }
      }
      // console.log("assetIdArray", assetIdArray);
      // console.log("packageAssetIdArray", packageAssetIdArray);
      // transfer = await transfer.create({
      //   transferDocumentNumber: newestTransferDocumentNumber + 1,
      //   transferSector,
      //   subSector,
      //   handler,
      //   transfereeSector,
      //   building,
      //   floor,
      //   room,

      //   name_recorder: name_recorder,
      //   // dateTime_recorder: new Date(),
      //   name_courier: name_recorder,
      //   dateTime_courier: new Date(),
      //   name_approver: name_approver,
      //   dateTime_approver: dateTime_approver,
      //   status: status,
      //   assetIdArray,
      //   packageAssetIdArray
      // });
    }
    res.status(200).json({ transfer });
  } catch (err) {
    next(err);
  }
};
