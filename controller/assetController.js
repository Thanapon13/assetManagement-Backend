const { asset, assetImage, TB_ASSET_DOCUMENTS } = require("../models");

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

      //สัญาการจัดซื้อ
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
      distributionNote: req.body.distributionNote // หมายเหตุ
    };
    console.log("inputAssetObject:", inputAssetObject);

    await asset.create(inputAssetObject);

    const roomImages = [];

    for (let i = 0; i < req.files.arrayImage.length; i++) {
      const roomImage = req.files.arrayImage[i].path;

      console.log("roomImage:", roomImage);
      roomImages.push(roomImage);
      console.log("Uploaded roomImage:", roomImage);
    }

    const genDataArray = {
      Image: JSON.stringify(roomImages)
    };

    console.log("genDataArray:", genDataArray);

    await assetImage.create(genDataArray);

    res.status(200).json({ message: "Successfully created" });
  } catch (err) {
    next(err);
  }
};
