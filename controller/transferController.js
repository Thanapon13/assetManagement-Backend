const { transfer, subComponentTransfer } = require("../models");

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
    console.log("inputObject:", inputObject);

    // for store in transfer schema
    let assetIdArray = [];
    let packageAssetIdArray = [];

    // for query
    let assetIdHasAssetNumberArray = [];
    let packageAssetIdHasAssetNumberArray = [];
    let transfers;

    let newestTransferDocumentNumber;
    let newestTransfer = await transfer.findOne({
      attributes: ["transferDocumentNumber"]
    });
    // console.log("newestTransfer:", newestTransfer);

    if (newestTransfer == null) {
      newestTransferDocumentNumber = 0;
    } else {
      newestTransferDocumentNumber = parseInt(
        newestTransfer.transferDocumentNumber
      );
    }

    // console.log("newestTransferDocumentNumber:", newestTransferDocumentNumber);
    // console.log("transferSector:", transferSector);
    // console.log("subSector:", subSector);
    // console.log("transfereeSector:", transfereeSector);
    // console.log("building:", building);
    // console.log("floor:", floor);
    // console.log("room:", room);
    // console.log("name_recorder:", name_recorder);
    // console.log("name_courier:", name_courier);
    // console.log("dateTime_courier:", dateTime_courier);
    // console.log("name_approver:", name_approver);
    // console.log("dateTime_approver:", dateTime_approver);
    // console.log("status:", status);

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

      console.log(
        "createSubComponentTransferData:",
        createSubComponentTransferData
      );

      let subComponentTransfers = await subComponentTransfer.create(
        createSubComponentTransferData
      );
      console.log("subComponentTransfers:", subComponentTransfers);
    } else {
      for (let i = 0; i < saveTransferTableArrayObject.length; i++) {
        if (saveTransferTableArrayObject[i].assetNumber !== "") {
          if (saveTransferTableArrayObject[i].isPackage) {
            console.log(
              "saveTransferTableArrayObject[i].assetNumber:",
              saveTransferTableArrayObject[i].assetNumber
            );
          }
        }
      }
    }

    res.status(200).json({ message: "Create Trander success" });
  } catch (err) {
    next(err);
  }
};
