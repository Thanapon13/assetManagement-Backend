const { Op } = require("sequelize");
const sequelize = require("sequelize");

const Asset = require("../models").asset;
const AssetImage = require("../models").assetImage;
const AssetDocument = require("../models").assetDocument;
const PackageAsset = require("../models").pkAsset;
const PackageAssetImage = require("../models").pkAssetImage;
const PackageAssetDocument = require("../models").pkAssetDocument;
const BottomSubComponentDataPkAsset =
  require("../models").bottomSubComponentDataPkAsset;
const SubComponentPkAsset = require("../models").subComponentPkAsset;
const fs = require("fs");
const moment = require("moment/moment");
const { ObjectID } = require("bson");

function delete_file(path) {
  fs.unlink(path, (err) => {
    if (err) throw err;
    console.log(path + " was deleted");
  });
}

function duplicate_file(pathRead, pathWrite) {
  var inStr = fs.createReadStream(pathRead);
  var outStr = fs.createWriteStream(pathWrite);

  inStr.pipe(outStr);
}

exports.createPackageAsset = async (req, res, next) => {
  try {
    const {
      genDataJSON,
      input,

      // file
      baseArrayImage,
      baseArrayDocument,

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

      bottomSubComponentDataJSON,
    } = req.body;
    console.log(req.body);

    const inputObject = JSON.parse(input);
    console.log("inputObject", inputObject);
    let {
      engProductName,
      productName,
      type,
      kind,
      // realAssetId,
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
      guaranteedMonth,
      purposeOfUse,
      assetGroupNumber,
      type4,
      type8,
      type13,
      allSector,

      status,
    } = inputObject;

    // console.log(req.body);

    // console.log("baseArrayImage", baseArrayImage);
    //  console.log("baseArrayDocument", baseArrayDocument);
    // console.log("duplicatedArrayImage", duplicatedArrayImage);

    const baseArrayImageObj = JSON.parse(baseArrayImage);
    // console.log("baseArrayImageObj.length",baseArrayImageObj.length)
    const baseArrayDocumentObj = JSON.parse(baseArrayDocument);
    // console.log("baseArrayDocumentObj.length",baseArrayDocumentObj.length)

    const objGenDataArray = JSON.parse(genDataJSON);

    const arrayImage = req?.files?.arrayImage || [];
    // console.log("arrayImage.length",arrayImage.length)
    // console.log("arrayImage",arrayImage)
    const arrayDocument = req?.files?.arrayDocument || [];
    // console.log("arrayDocument.length",arrayDocument.length)
    // console.log("arrayDocument",arrayDocument)

    const objSubComponentArray = JSON.parse(bottomSubComponentDataJSON);
    console.log("objSubComponentArray.length", objSubComponentArray.length);
    // for gen new realAssetId
    let newestAsset = await Asset.findOne({
      order: [["createdAt", "DESC"]],
      attributes: ["_id", "realAssetId"],
    });
    //   .sort([["createdAt", -1]])
    //   .select("realAssetId");
    let newestRealAssetId;
    if (newestAsset == null) {
      newestRealAssetId = 0;
    } else {
      newestRealAssetId = parseInt(newestAsset.realAssetId);
    }
    if (status == "saveDraft") {
      let packageAsset = await PackageAsset.create({
        realAssetId: newestRealAssetId + 1,
        engProductName: engProductName,
        productName: productName,
        type: type,
        kind: kind,
        unit: unit,
        brand: brand,
        model: model,
        size: size,
        quantity: quantity,
        source: source,
        category: category,
        acquiredType: acquiredType,
        group: group,
        pricePerUnit: pricePerUnit,
        guaranteedMonth: guaranteedMonth,
        purposeOfUse: purposeOfUse,
        assetGroupNumber: assetGroupNumber,
        type4: type4,
        type8: type8,
        type13: type13,
        allSector: allSector,

        status: status,
        reserved: false,

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
      });
      for (let i = 0; i < baseArrayImageObj.length; i++) {
        await PackageAssetImage.create({
          image: arrayImage[i].filename,
          packageAssetId: packageAsset._id,
        });
      }
      // console.log("saveImageArray",saveImageArray)
      for (let i = 0; i < baseArrayDocumentObj.length; i++) {
        await PackageAssetDocument.create({
          document: arrayDocument[i].filename,
          packageAssetId: packageAsset._id,
        });
      }
      for (let i = 0; i < objSubComponentArray.length; i++) {
        console.log(12312312);
        await BottomSubComponentDataPkAsset.create({
          packageAssetId: packageAsset._id,
          serialNumber: objSubComponentArray[i].serialNumber,
          productName: objSubComponentArray[i].productName,
          assetNumber: objSubComponentArray[i].assetNumber,
          sector: objSubComponentArray[i].sector,
          price: objSubComponentArray[i].price,
          asset01: objSubComponentArray[i].asset01,
        });
      }
      for (let i = 0; i < objGenDataArray.length; i++) {
        await SubComponentPkAsset.create({
          packageAssetId: packageAsset._id,
          assetNumber: objGenDataArray[i].assetNumber,
          serialNumber: objGenDataArray[i].serialNumber,
          replacedAssetNumber: objGenDataArray[i].replacedAssetNumber,
          sector: objGenDataArray[i].sector,
          asset01: objGenDataArray[i].asset01,
        });
      }
      console.log(packageAsset);
    } else {
      objGenDataArray.forEach(async (el, index) => {
        // console.log(`Package${index+1}`)

        // console.log("saveDocumentArray",saveDocumentArray)
        let packageAsset = await PackageAsset.create({
          realAssetId: newestRealAssetId + 1,
          assetNumber: el.assetNumber,
          sector: el.sector,
          replacedAssetNumber: el.replacedAssetNumber,
          engProductName: engProductName,
          productName: productName,
          type: type,
          kind: kind,
          unit: unit,
          brand: brand,
          model: model,
          size: size,
          quantity: quantity,
          source: source,
          category: category,
          acquiredType: acquiredType,
          group: group,
          pricePerUnit: pricePerUnit,
          guaranteedMonth: guaranteedMonth,
          purposeOfUse: purposeOfUse,
          assetGroupNumber: assetGroupNumber,
          type4: type4,
          type8: type8,
          type13: type13,
          allSector: allSector,

          status: status,
          reserved: false,

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
        });
        for (let i = 0; i < baseArrayImageObj.length; i++) {
          await PackageAssetImage.create({
            image:
              arrayImage[(+quantity + +objSubComponentArray.length) * i + index]
                .filename,
            packageAssetId: packageAsset._id,
          });
        }
        // console.log("saveImageArray",saveImageArray)

        for (let i = 0; i < baseArrayDocumentObj.length; i++) {
          await PackageAssetDocument.create({
            document:
              arrayDocument[
                (+quantity + +objSubComponentArray.length) * i + index
              ].filename,
            packageAssetId: packageAsset._id,
          });
        }
        for (
          let i = index * quantity;
          i < (index + 1) * quantity && i < objSubComponentArray.length;
          i++
        ) {
          //   let saveSubImageArray = [];
          //   let saveSubDocumentArray = [];
          // console.log(`Asset${i+1}`)
          // console.log("packageAsset._id",packageAsset._id)

          // console.log("saveSubDocumentArray",saveSubDocumentArray)
          await Asset.create({
            realAssetId: newestRealAssetId++,
            serialNumber: objSubComponentArray[i].serialNumber,
            // engProductName,
            productName: objSubComponentArray[i].productName,
            assetNumber: objSubComponentArray[i].assetNumber,
            sector: objSubComponentArray[i].sector,
            pricePerUnit: objSubComponentArray[i].price,
            asset01: objSubComponentArray[i].asset01,

            // sector: el.sector,
            replacedAssetNumber: el.replacedAssetNumber,
            type: type,
            kind: kind,
            unit: unit,
            brand: brand,
            model: model,
            size: size,
            quantity: quantity,
            source: source,
            category: category,
            acquiredType: acquiredType,
            group: group,
            pricePerUnit: pricePerUnit,
            guaranteedMonth: guaranteedMonth,
            purposeOfUse: purposeOfUse,
            assetGroupNumber: assetGroupNumber,
            type4: type4,
            type8: type8,
            type13: type13,
            allSector: allSector,

            status: status,
            reserved: false,

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
            accumulateDepreciationRemainPrice:
              accumulateDepreciationRemainPrice,
            accumulateDepreciationBookValue: accumulateDepreciationBookValue,

            // image
            // imageArray: saveSubImageArray,

            // document
            // documentArray: saveSubDocumentArray,

            status,
            reserved: false,

            packageAssetId: packageAsset._id,
          });
          for (let j = 0; j < baseArrayImageObj.length; j++) {
            await AssetImage.create({
              image:
                arrayImage[
                  (+quantity + objSubComponentArray.length) * j + +quantity + i
                ].filename,
              packageAssetId: packageAsset._id,
            });
          }
          // console.log("saveSubImageArray",saveSubImageArray)
          for (let j = 0; j < baseArrayDocumentObj.length; j++) {
            await AssetDocument.create({
              document:
                arrayDocument[
                  (+quantity + objSubComponentArray.length) * j + +quantity + i
                ].filename,
              packageAssetId: packageAsset._id,
            });
          }
        }
      });
    }

    res
      .status(200)
      .json({ message: "Package assets and assets created successfully" });
  } catch (err) {
    next(err);
  }
};

exports.updatePackageAsset = async (req, res, next) => {
  try {
    const packageAssetId = req.params.packageAssetId;
    const {
      genDataJSON,
      bottomSubComponentDataJSON,
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
    } = req.body;
    // console.log(req.body);

    const inputObject = JSON.parse(input);
    let bottomSubComponentDataObject = [];
    // console.log(bottomSubComponentDataObject)
    let existArrayImageArray = [];
    let existArrayDocumentArray = [];

    // console.log("existArrayImageArray", existArrayImageArray);

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
      allSector,
      source,
      sector,
      category,
      acquiredType,
      group,
      pricePerUnit,
      assetGroupNumber,
      guaranteedMonth,
      purposeOfUse,
      asset01,
      replacedAssetNumber,
      serialNumber,
      type4,
      type8,
      type13,
      status,
    } = inputObject;
    bottomSubComponentDataObject = JSON.parse(bottomSubComponentDataJSON);
    // console.log(bottomSubComponentDataObject)
    existArrayImageArray = JSON.parse(existArrayImage);
    existArrayDocumentArray = JSON.parse(existArrayDocument);

    // arrayImage , arrayDocument มีเฉพาะ new file ที่ส่งเข้ามา
    const arrayImage = req?.files?.arrayImage || [];
    const arrayDocument = req?.files?.arrayDocument || [];

    const packageAssetById = await PackageAsset.findByPk(packageAssetId);
    console.log("data", packageAssetById);
    if (status == "inStock" && packageAssetById.status == "saveDraft") {
      let lengthOfBaseImageArray =
        arrayImage.length /
        (quantity * bottomSubComponentDataObject.length + quantity);
      let lengthOfBaseDocumentArray =
        arrayDocument.length /
        (quantity * bottomSubComponentDataObject.length + quantity);
      let lengthOfBaseBottomSubComponentData =
        bottomSubComponentDataObject.length / quantity;
      console.log(
        "lengthOfBaseImageArray",
        lengthOfBaseImageArray,
        " , ",
        "lengthOfBaseDocumentArray",
        lengthOfBaseDocumentArray
      );
      let newestAsset = await Asset.findOne({
        order: [["createdAt", "DESC"]],
        attributes: ["_id", "realAssetId"],
      });
      let newestRealAssetId = parseInt(newestAsset.realAssetId) - 1;
      const genDataArray = JSON.parse(genDataJSON);
      genDataArray.forEach(async (el, index) => {
        // let saveImageArray = [];
        // let saveDocumentArray = [];
        // console.log(`Package${index+1}`)

        newestRealAssetId = newestRealAssetId + 1;
        let packageAsset = await PackageAsset.create({
          realAssetId: newestRealAssetId,
          assetNumber: el.assetNumber,
          sector: el.sector,
          replacedAssetNumber: el.replacedAssetNumber,
          engProductName: engProductName,
          productName: productName,
          type: type,
          kind: kind,
          unit: unit,
          brand: brand,
          model: model,
          size: size,
          quantity: quantity,
          source: source,
          category: category,
          acquiredType: acquiredType,
          group: group,
          pricePerUnit: pricePerUnit,
          guaranteedMonth: guaranteedMonth,
          purposeOfUse: purposeOfUse,
          assetGroupNumber: assetGroupNumber,
          type4: type4,
          type8: type8,
          type13: type13,
          allSector: allSector,

          status: status,
          reserved: false,

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
        });

        // saveImageAndDocument ///////////////////////////////////////////////////////////
        for (let j = 0; j < existArrayImageArray.length; j++) {
          if (index == 0) {
            await PackageAssetImage.create({
              image: existArrayImageArray[j].image,
              packageAssetId: packageAsset._id,
            });
            // saveImageArray.push({ image: existArrayImageArray[j].image });
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
            await PackageAssetImage.create({
              image: newImageName,
              packageAssetId: packageAsset._id,
            });
            // saveImageArray.push({ image: newImageName });
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
            await PackageAssetDocument.create({
              document: existArrayDocumentArray[j].document,
              packageAssetId: packageAsset._id,
            });
            // saveDocumentArray.push({
            //   document: existArrayDocumentArray[j].document,
            // });
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
            await PackageAssetDocument.create({
              document: newDocumentName,
              packageAssetId: packageAsset._id,
            });
            // saveDocumentArray.push({ document: newDocumentName });
            // console.log("DocumentName", existArrayDocumentArray[j].document);
            // console.log("newDocumentName", newDocumentName);
            duplicate_file(
              `./public/documents/${existArrayDocumentArray[j].document}`,
              `./public/documents/${newDocumentName}`
            );
          }
        }
        for (let i = 0; i < lengthOfBaseImageArray.length; i++) {
          await PackageAssetImage.create({
            image:
              arrayImage[
                (+quantity + +bottomSubComponentDataObject.length) * i + index
              ].filename,
            packageAssetId: packageAsset._id,
          });
          // saveImageArray.push({
          //   image:
          //     arrayImage[
          //       (+quantity + +bottomSubComponentDataObject.length) * i + index
          //     ].filename,
          // });
        }
        // console.log("saveImageArray",saveImageArray)

        for (let i = 0; i < lengthOfBaseDocumentArray.length; i++) {
          await PackageAssetDocument.create({
            document:
              arrayDocument[
                (+quantity + +bottomSubComponentDataObject.length) * i + index
              ].filename,
            packageAssetId: packageAsset._id,
          });
          // saveDocumentArray.push({
          //   document:
          //     arrayDocument[
          //       (+quantity + +bottomSubComponentDataObject.length) * i + index
          //     ].filename,
          // });
        }
        // saveImageAndDocument ///////////////////////////////////////////////////////////

        console.log(
          "bottomSubComponentDataObjectlength",
          bottomSubComponentDataObject.length
        );
        for (
          let i = index * lengthOfBaseBottomSubComponentData;
          i < (index + 1) * lengthOfBaseBottomSubComponentData &&
          i < bottomSubComponentDataObject.length;
          i++
        ) {
          console.log("indexOfCreateAsset", i);
          // console.log(`Asset${i+1}`)
          // console.log("packageAsset._id",packageAsset._id)

          // console.log("saveSubDocumentArray",saveSubDocumentArray)
          // newestRealAssetId = newestRealAssetId + 1;
          let assetCreate = await Asset.create({
            realAssetId: newestRealAssetId,
            serialNumber: bottomSubComponentDataObject[i].serialNumber,
            // engProductName,
            productName: bottomSubComponentDataObject[i].productName,
            assetNumber: bottomSubComponentDataObject[i].assetNumber,
            sector: bottomSubComponentDataObject[i].sector,
            pricePerUnit: bottomSubComponentDataObject[i].price,
            asset01: bottomSubComponentDataObject[i].asset01,

            sector: el.sector,
            replacedAssetNumber: el.replacedAssetNumber,
            type: type,
            kind: kind,
            unit: unit,
            brand: brand,
            model: model,
            size: size,
            quantity: quantity,
            source: source,
            category: category,
            acquiredType: acquiredType,
            group: group,
            pricePerUnit: pricePerUnit,
            guaranteedMonth: guaranteedMonth,
            purposeOfUse: purposeOfUse,
            assetGroupNumber: assetGroupNumber,
            type4: type4,
            type8: type8,
            type13: type13,
            allSector: allSector,
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
            accumulateDepreciationRemainPrice:
              accumulateDepreciationRemainPrice,
            accumulateDepreciationBookValue: accumulateDepreciationBookValue,

            status: status,
            reserved: false,

            packageAssetId: packageAsset._id,
          });
          for (let j = 0; j < existArrayImageArray.length; j++) {
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
            await AssetImage.create({
              image: newImageName,
              assetId: assetCreate._id,
            });
            // saveSubImageArray.push({ image: newImageName });
            // console.log("ImageName", existArrayImageArray[j].image);
            // console.log("newImageName", newImageName);
            duplicate_file(
              `./public/pics/${existArrayImageArray[j].image}`,
              `./public/pics/${newImageName}`
            );
          }
          for (let j = 0; j < existArrayDocumentArray.length; j++) {
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
            await AssetDocument.create({
              document: newDocumentName,
              asset: assetCreate._id,
            });
            // saveSubDocumentArray.push({ document: newDocumentName });
            // console.log("DocumentName", existArrayDocumentArray[j].document);
            // console.log("newDocumentName", newDocumentName);
            duplicate_file(
              `./public/documents/${existArrayDocumentArray[j].document}`,
              `./public/documents/${newDocumentName}`
            );
          }
          for (let j = 0; j < lengthOfBaseImageArray.length; j++) {
            await AssetImage.create({
              image:
                arrayImage[
                  (+quantity + bottomSubComponentDataObject.length) * j +
                    +quantity +
                    i
                ].filename,
              assetId: assetCreate._id,
            });
          }
          // console.log("saveSubImageArray",saveSubImageArray)
          for (let j = 0; j < lengthOfBaseDocumentArray.length; j++) {
            await AssetDocument.create({
              document:
                arrayDocument[
                  (+quantity + bottomSubComponentDataObject.length) * j +
                    +quantity +
                    i
                ].filename,
              asset: assetCreate._id,
            });
          }
        }
      });
      await PackageAsset.destroy({ where: { _id: packageAssetId } });
      return res
        .status(200)
        .json({ message: "This packageAsset  updated successfully" });
    }

    const oldImageArray = await PackageAssetImage.findAll({
      where: { packageAssetId: packageAssetId },
    });
    const oldDocumentArray = PackageAssetDocument.findAll({
      where: { packageAssetId: packageAssetId },
    });

    if (arrayImage.length > 0) {
      for (el of arrayImage) {
        s;
        await PackageAssetImage.create({
          image: el.filename,
          packageAssetId: packageAssetId,
        });
        // await PackageAsset.updateOne(
        //   { _id: packageAssetId },
        //   { $push: { imageArray: { image: el.filename } } }
        // );
      }
    }

    if (arrayDocument.length > 0) {
      for (el of arrayDocument) {
        await PackageAssetDocument.create({
          document: el.filename,
          packageAssetId: packageAssetId,
        });
        // await PackageAsset.updateOne(
        //   { _id: packageAssetId },
        //   { $push: { documentArray: { document: el.filename } } }
        // );
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

    // delete not exist the imageArray and documentArray fields of the asset in Schema
    if (notExistArrayImage.length > 0) {
      for (let i = 0; i < notExistArrayImage.length; i++) {
        await PackageAssetImage.destroy({
          where: { _id: notExistArrayImage[i]._id },
        });
        delete_file(`./public/pics/${notExistArrayImage[i].image}`);
      }
    }
    if (notExistArrayDocument.length > 0) {
      for (let i = 0; i < notExistArrayDocument.length; i++) {
        await PackageAssetDocument.destroy({
          where: { _id: notExistArrayDocument[i]._id },
        });
        delete_file(`./public/documents/${notExistArrayDocument[i].document}`);
      }
    }
    packageAssetById.status = status ?? packageAssetById.status;
    packageAssetById.engProductName = engProductName;
    packageAssetById.productName = productName;
    packageAssetById.type = type;
    packageAssetById.kind = kind;
    packageAssetById.unit = unit;
    packageAssetById.brand = brand;
    packageAssetById.model = model;
    packageAssetById.size = size;
    packageAssetById.quantity = quantity;
    packageAssetById.source = source;
    packageAssetById.sector = sector;
    packageAssetById.category = category;
    packageAssetById.acquiredType = acquiredType;
    packageAssetById.group = group;
    packageAssetById.pricePerUnit = pricePerUnit;
    packageAssetById.assetGroupNumber = assetGroupNumber;
    packageAssetById.allSector = allSector;
    packageAssetById.guaranteedMonth = guaranteedMonth;
    packageAssetById.purposeOfUse = purposeOfUse;
    packageAssetById.insuranceStartDate = insuranceStartDate;
    packageAssetById.insuranceExpiredDate = insuranceExpiredDate;
    packageAssetById.allSector = allSector;
    packageAssetById.asset01 = asset01;
    packageAssetById.serialNumber = serialNumber;
    packageAssetById.replacedAssetNumber = replacedAssetNumber;

    //สัญญาจัดซื้อ
    packageAssetById.purchaseContract.acquisitionMethod = acquisitionMethod;
    packageAssetById.purchaseContract.moneyType = moneyType;
    packageAssetById.purchaseContract.deliveryDocument = deliveryDocument;
    packageAssetById.purchaseContract.contractNumber = contractNumber;
    packageAssetById.purchaseContract.receivedDate = receivedDate;
    packageAssetById.purchaseContract.seller = seller;
    packageAssetById.purchaseContract.price = price;
    packageAssetById.purchaseContract.billNumber = billNumber;
    packageAssetById.purchaseContract.purchaseYear = purchaseYear;
    packageAssetById.purchaseContract.purchaseDate = purchaseDate;
    packageAssetById.purchaseContract.documentDate = documentDate;

    // การจำหน่าย
    packageAssetById.distribution.salesDocument = salesDocument;
    packageAssetById.distribution.distributeDocumentDate =
      distributeDocumentDate;
    packageAssetById.distribution.distributeApprovalReleaseDate =
      distributeApprovalReleaseDate;
    packageAssetById.distribution.distributeStatus = distributeStatus;
    packageAssetById.distribution.distributionNote = distributionNote;

    // ค่าเสื่อม
    packageAssetById.depreciationStartDate = depreciationStartDate;
    packageAssetById.depreciationRegisterDate = depreciationRegisterDate;
    packageAssetById.depreciationReceivedDate = depreciationReceivedDate;
    packageAssetById.depreciationPrice = depreciationPrice;
    packageAssetById.depreciationYearUsed = depreciationYearUsed;
    packageAssetById.depreciationCarcassPrice = depreciationCarcassPrice;
    packageAssetById.depreciationProcess = depreciationProcess;
    packageAssetById.depreciationPresentMonth = depreciationPresentMonth;
    packageAssetById.depreciationCumulativePrice = depreciationCumulativePrice;
    packageAssetById.depreciationYearPrice = depreciationYearPrice;
    packageAssetById.depreciationRemainPrice = depreciationRemainPrice;
    packageAssetById.depreciationBookValue = depreciationBookValue;

    // ค่าเสื่อมรายปี
    packageAssetById.accumulateDepreciationStartDate =
      accumulateDepreciationStartDate;
    packageAssetById.accumulateDepreciationRegisterDate =
      accumulateDepreciationRegisterDate;
    packageAssetById.accumulateDepreciationReceivedDate =
      accumulateDepreciationReceivedDate;
    packageAssetById.accumulateDepreciationPrice = accumulateDepreciationPrice;
    packageAssetById.accumulateDepreciationYearUsed =
      accumulateDepreciationYearUsed;
    packageAssetById.accumulateDepreciationCarcassPrice =
      accumulateDepreciationCarcassPrice;
    packageAssetById.accumulateDepreciationProcess =
      accumulateDepreciationProcess;
    packageAssetById.accumulateDepreciationPresentMonth =
      accumulateDepreciationPresentMonth;
    packageAssetById.accumulateDepreciationCumulativePrice =
      accumulateDepreciationCumulativePrice;
    packageAssetById.accumulateDepreciationYearPrice =
      accumulateDepreciationYearPrice;
    packageAssetById.accumulateDepreciationRemainPrice =
      accumulateDepreciationRemainPrice;
    packageAssetById.accumulateDepreciationBookValue =
      accumulateDepreciationBookValue;

    packageAssetById.reserved = reserved;
    console.log("bottomSubComponentDataArray", bottomSubComponentDataObject);
    if (status == "saveDraft") {
      const genDataArray = JSON.parse(genDataJSON);
      await SubComponentPkAsset.destroy({
        where: { packageAssetId: packageAssetId },
      });
      for (let i = 0; i < genDataArray.length; i++) {
        await SubComponentPkAsset.create({
          packageAssetId: packageAssetId,
          assetNumber: genDataArray[i].assetNumber,
          serialNumber: genDataArray[i].serialNumber,
          replacedAssetNumber: genDataArray[i].replacedAssetNumber,
          sector: genDataArray[i].sector,
          asset01: genDataArray[i].asset01,
        });
      }
      await BottomSubComponentDataPkAsset.destroy({
        where: { packageAssetId: packageAssetId },
      });
      for (let i = 0; i < bottomSubComponentDataObject.length; i++) {
        await BottomSubComponentDataPkAsset.create({
          packageAssetId: packageAssetId,
          serialNumber: bottomSubComponentDataObject[i].serialNumber,
          productName: bottomSubComponentDataObject[i].productName,
          assetNumber: bottomSubComponentDataObject[i].assetNumber,
          sector: bottomSubComponentDataObject[i].sector,
          price: bottomSubComponentDataObject[i].price,
          asset01: bottomSubComponentDataObject[i].asset01,
        });
      }
    } else {
      for (let el of bottomSubComponentDataObject) {
        // console.log(el._id)
        // console.log(el.serialNumber)
        // console.log(el.pricePerUnit)
        // console.log(el.asset01)
        let assetById = await Asset.findByPk(el._id);
        // console.log(assetById)
        assetById.serialNumber = el.serialNumber;
        assetById.pricePerUnit = el.pricePerUnit;
        assetById.asset01 = el.asset01;
        assetById.save();
      }
    }
    await packageAssetById.save();

    res.status(200).json({ message: "This packageAsset updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getSectorForSearch = async (req, res, next) => {
  try {
    const sector = await PackageAsset.findAll({
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

exports.deletePackageAsset = async (req, res, next) => {
  try {
    const { packageAssetId } = req.params;
    const { reason } = req.body;
    const packageAssetById = await PackageAsset.findOne({
      where: {
        _id: packageAssetId,
      },
    });
    if (packageAssetById == null)
      return res.json("This packageAsset not found");
    if (packageAssetById.status == "saveDraft") {
      await PackageAsset.destroy({ where: { _id: packageAssetById._id } });
    } else {
      const packageAsset = await PackageAsset.find({
        where: { _id: packageAssetId },
        include: [{ model: Asset, as: "assets" }],
      });
      //   const packageAsset = await PackageAsset.aggregate([
      //     { $match: { _id: ObjectID(packageAssetId) } },
      //     {
      //       $lookup: {
      //         from: "assets",
      //         localField: "_id",
      //         foreignField: "packageAssetId",
      //         as: "asset",
      //       },
      //     },
      //   ]);

      const assets = packageAsset[0].assets;

      if (assets.length > 0) {
        for (el of assets) {
          let assetId = el._id;
          console.log(720, assetId);
          await Asset.update(
            { reason: reason, deletedAt: new Date() },

            { _id: assetId }
          );
        }
      }

      // change delete function
      await PackageAsset.update(
        { reason: reason, deletedAt: new Date() },

        {
          _id: packageAssetId,
        }
      );

      // await PackageAsset.deleteOne({ _id: packageAssetId });
    }

    res.json("delete packageAsset successfully");
  } catch (err) {
    next(err);
  }
};

exports.getPackageAssetBySearch = async (req, res, next) => {
  try {
    // for one search but can find in 2 field(serialNumber,productName)
    // const search = req.query.search || "";

    console.log(11111111111);

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

    let modifiedDateFrom = "";
    if (dateFrom) {
      const dateFromObj = new Date(dateFrom);
      // dateFromObj.setFullYear(dateFromObj.getFullYear() - 543);
      // dateFromObj.setHours(dateFromObj.getHours() - 7);
      modifiedDateFrom = dateFromObj.toString();
    }

    let modifiedDateTo = "";
    if (dateTo) {
      const dateToObj = new Date(dateTo);
      // dateToObj.setFullYear(dateToObj.getFullYear() - 543);
      // dateToObj.setHours(dateToObj.getHours() - 7);
      modifiedDateTo = dateToObj.toString();
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

    const packageAsset = await PackageAsset.findAll({
      where: { [Op.and]: queryArray },

      // include: [{ model: Asset, require: false, as: "assets" }],

      order: [["updatedAt", "DESC"]],
      offset: page * limit,
      limit: limit,
    });
    // .sort({ updatedAt: -1 })
    // .skip(page * limit)
    // .limit(limit);

    // for show how many pages
    const total = await PackageAsset.count({ where: { [Op.and]: queryArray } });

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

    res.json({ packageAsset, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getAllPackageAsset = async (req, res, next) => {
  try {
    // for 2 field search
    // const assetNumber = req.query.assetNumber || "";
    // const status = req.query.status || "";
    // const assetDate = req.query.createdAt || "";
    // const assetEndDate = req.query.createdAt || "";
    // const sector = req.query.sector || "";
    // const page = parseInt(req.query.page) - 1 || 0;
    // const limit = parseInt(req.query.limit) || 10;
    // console.log(status);
    // let query = {};

    // if (assetDate !== "") {
    //   query["createdAt"] = {
    //     $gte: assetDate,
    //     $lte: moment(today).endOf("day").toDate(),
    //   };
    // }
    // if (assetEndDate !== "") {
    //   query["createdAt"] = {
    //     $lte: assetEndDate,
    //   };
    // }
    // if (assetDate !== "" && assetEndDate !== "") {
    //   query["createdAt"] = {
    //     $gte: assetDate,
    //     $lte: assetEndDate,
    //   };
    // }
    // // for 2 field search
    // if (assetNumber !== "") {
    //   query["assetNumber"] = { $regex: assetNumber, $options: "i" };
    // }
    // if (sector !== "") {
    //   query["sector"] = sector;
    // }

    // query["status"] = {
    //   $regex: status,
    //   $options: "i",
    //   // $ne: "delete",
    // };
    // query["deletedAt"] = { $eq: null };

    // const packageAsset = await PackageAsset.aggregate([
    //   { $match: query },
    //   {
    //     $lookup: {
    //       from: "assets",
    //       localField: "_id",
    //       foreignField: "packageAssetId",
    //       as: "asset",
    //     },
    //   },
    // ])
    const packageAsset = await PackageAsset.findAll({
      include: [
        {
          model: Asset,
          require: false,
          as: "assets",
          include: [
            {
              model: AssetImage,
              as: "assetImages",
            },
          ],
          include: [
            {
              model: AssetDocument,
              as: "assetDocuments",
            },
          ],
        },
      ],
      include: [
        {
          model: PackageAssetImage,
          as: "packageAssetImages",
        },
      ],
      include: [
        {
          model: PackageAssetDocument,
          as: "packageAssetDocuments",
        },
      ],
      include: [
        {
          model: BottomSubComponentDataPkAsset,
          as: "bottomSubComponentDataPackagekAssets",
        },
      ],
      include: [
        {
          model: SubComponentPkAsset,
          as: "subComponentPackageAssets",
        },
      ],
    });
    //   .sort({ updatedAt: -1 })
    //   .skip(page * limit)
    //   .limit(limit);

    // for show how many pages
    // const total = await PackageAsset.countDocuments(query);

    // console.log(asset);
    res.json({ packageAsset });
  } catch (err) {
    next(err);
  }
};

exports.getPackageAssetById = async (req, res, next) => {
  try {
    const packageAssetId = req.params.packageAssetId;
    // const packageAsset = await PackageAsset.aggregate([
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
    const packageAsset = await PackageAsset.findOne({
      where: { _id: packageAssetId },
      // include: [
      //   {
      //     model: Asset,
      //     require: false,
      //     as: "assets",
      //     include: [
      //       {
      //         model: AssetImage,
      //         as: "assetImages",
      //       },
      //     ],
      //     include: [
      //       {
      //         model: AssetDocument,
      //         as: "assetDocuments",
      //       },
      //     ],
      //   },
      // ],
      // include: [
      //   {
      //     model: PackageAssetImage,
      //     require: false,

      //     as: "packageAssetImages",
      //   },
      // ],
      // include: [
      //   {
      //     model: PackageAssetDocument,
      //     require: false,

      //     as: "packageAssetDocuments",
      //   },
      // ],
      include: [
        {
          model: BottomSubComponentDataPkAsset,
          require: false,

          as: "bottomSubComponentDataPackageAssets",
        },
      ],
      include: [
        {
          model: SubComponentPkAsset,
          require: false,

          as: "subComponentPackageAssets",
        },
      ],
    });
    // console.log(asset);
    // const packageAsset = await PackageAsset.findById({ _id: packageAssetId });
    res.json({ packageAsset });
  } catch (err) {
    next(err);
  }
};

exports.getAllSector = async (req, res, next) => {
  try {
    const sector = await PackageAsset.aggregate([
      {
        $match: {
          $and: [{ deletedAt: { $eq: null } }, { sector: { $ne: null } }],
        },
      },
      {
        $group: {
          _id: { sector: "$sector" },
          numberOfzipcodes: { $sum: 1 },
        },
      },
      {
        $project: {
          sector: "$_id.sector",
          numberOfzipcodes: "$numberOfzipcodes",
          _id: 0,
        },
      },
      {
        $sort: {
          sector: 1,
        },
      },
    ]);
    res.json({ sector });
  } catch (err) {
    next(err);
  }
};