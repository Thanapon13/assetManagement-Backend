const {
  asset,
  assetImage,
  subComponentAsset,
  assetDocument
} = require("../models");

exports.createAsset = async (req, res, next) => {
  try {
    const inputAssetObject = {
      //create ข้อมูลครุภัณฑ์
      productName: req.body.productName, // ชื่อไทย
      engProductName: req.body.engProductName, // ชื่อภาษาอังกฤษ
      type: req.body.type, // ประเภท
      kind: req.body.kind,
      assetNumber: req.body.assetNumber, //
      quantity: req.body.quantity, // จำนวน
      unit: req.body.unit, // หน่อยนับ
      brand: req.body.brand, // ยี่ห้อ
      model: req.body.model, //รุ่น
      size: req.body.size, // ขนาด
      category: req.body.category, // หมวดหมู่
      group: req.body.group, // กลุ่ม
      acquiredType: req.body.acquiredType, // ประเภททีได้มา
      source: req.body.source, // แหล่งที่ได้มา
      purposeOfUse: req.body.purposeOfUse, // วัตถุประสงค์ของการใช้งาน
      pricePerUnit: req.body.pricePerUnit, // ราคาต่อหน่วย
      guaranteedMonth: req.body.guaranteedMonth, // จำนวนเงินที่เดือนรับประกัน
      insuranceStartDate: req.body.insuranceStartDate, // วันที่เริ่มประกัน
      insuranceExpiredDate: req.body.insuranceExpiredDate, // วันสิ้นสุดประกัน

      //สัญญาการจัดซื้อ
      acquisitionMethod: req.body.acquisitionMethod, //วิธีการได้มา
      moneyType: req.body.moneyType, //ประเภทของเงิน
      contractNumber: req.body.contractNumber, // เลขที่สัญญา
      documentDate: req.body.documentDate, // เอกสารใบส่งของ
      billNumber: req.body.billNumber, // เลขที่ใบเบิก
      receivedDate: req.body.receivedDate, // วันที่รับมอบ
      seller: req.body.seller, //ผู้ขาย
      price: req.body.price, // ราคาซื้อ
      purchaseYear: req.body.purchaseYear, // ปีที่ซื้อ
      purchaseDate: req.body.purchaseDate, //วันที่ซื้อ
      deliveryDocument: req.body.deliveryDocument, //เอกสารจัดส่ง

      // การจำหน่าย
      salesDocument: req.body.salesDocument, // เอกสารจำหน่าย
      distributeDocumentDate: req.body.distributeDocumentDate, // เอกสารลงวันที่
      distributeApprovalReleaseDate: req.body.distributeApprovalReleaseDate, // วันอนุมติจำหน่าย
      distributeStatus: req.body.distributeStatus, // สถานะ
      distributionNote: req.body.distributionNote, // หมายเหตุ

      //status
      status: req.body.status
    };
    console.log("inputAssetObject:", inputAssetObject);

    // subComponentAsset
    const { genDataJSON } = req.body;
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
        ...inputAssetObject,
        realAssetId: newestRealAssetId + 1
      });

      const newAssetId = createdAsset.dataValues._id;
      console.log("newAssetId:", newAssetId);

      let saveImageArray = [];
      for (let i = 0; i < req.files.arrayImage.length; i++) {
        const roomImage = req.files.arrayImage[i];

        // console.log("roomImage:", roomImage);
        saveImageArray.push({
          image: roomImage.filename,
          assetId: newAssetId
        });
        // console.log("Uploaded roomImage:", roomImage);
      }
      console.log("saveImageArray:", saveImageArray);

      for (let i = 0; i < saveImageArray.length; i++) {
        const roomImage = saveImageArray[i];
        await assetImage.create(roomImage);
      }

      let saveDocumentArray = [];

      for (let d = 0; d < req.files.arrayDocument.length; d++) {
        const documentArray = req.files.arrayDocument[d];

        // console.log("documentArray:", documentArray);
        saveDocumentArray.push({
          document: documentArray.filename,
          assetId: newAssetId
        });
        // console.log("Uploaded documentArray:", documentArray);
      }

      for (let d = 0; d < saveDocumentArray.length; d++) {
        const documentArray = saveDocumentArray[d];
        await assetDocument.create(documentArray);
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
      for (let i = 0; i < req.body.quantity; i++) {
        console.log(" req.body.quantity:", req.body.quantity);
        const createdAsset = await asset.create({
          ...inputAssetObject,
          realAssetId: newestRealAssetId + 1
        });

        const newAssetId = createdAsset.dataValues._id;
        console.log("newAssetId:", newAssetId);

        let saveImageArray = [];
        for (let j = 0; j < req.files.arrayImage.length; j++) {
          const roomImage = req.files.arrayImage[j];

          console.log("roomImage:", roomImage);
          saveImageArray.push({
            image: roomImage.filename,
            assetId: newAssetId
          });
          // console.log("Uploaded roomImage:", roomImage);
        }
        console.log("saveImageArray:", saveImageArray);

        for (let j = 0; j < saveImageArray.length; j++) {
          const roomImage = saveImageArray[j];
          await assetImage.create(roomImage);
        }

        let saveDocumentArray = [];

        for (let j = 0; j < req.files.arrayDocument.length; j++) {
          const documentArray = req.files.arrayDocument[j];

          // console.log("documentArray:", documentArray);
          saveDocumentArray.push({
            document: documentArray.filename,
            assetId: newAssetId
          });
          // console.log("Uploaded documentArray:", documentArray);
        }

        for (let j = 0; j < saveDocumentArray.length; j++) {
          const documentArray = saveDocumentArray[j];
          await assetDocument.create(documentArray);
        }

        // Create subComponentAsset
        for (let j = 0; j < genDataArray.length; j++) {
          const subComponentData = genDataArray[j];
          await subComponentAsset.create({
            ...subComponentData,
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

    res.status(200).json({ puregetAllAssetData });
  } catch (err) {
    next(err);
  }
};
