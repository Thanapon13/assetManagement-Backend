module.exports = (sequelize, Sequelize) => {
  const asset = sequelize.define(
    "TB_ASSETS",
    {
      // ด้านล่างเป็นการตั้งค่า attribute ของ table นะครับ
      // ชื่อตัวแปรที่เราใช้เรียกแทน: { type: Sequelize.STRING(50), allowNull: false, field: 'ชื่อของ attribute' }
      // สามารถใส่ option เพิ่มเติมได้นะครับเช่น primaryKey: true อะไรแบบนี้
      // แล้วก็อันนี้สำคัญ ** ไม่จำเป็นต้องสร้าง attribute ที่เป็น FK จาก table อื่นนะครับ เพราะเราจะไปกำหนด relation กันใน file index
      _id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        field: "_id"
      },
      realAssetId: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "realAssetId"
      },
      assetNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "assetNumber"
      },
      serialNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "serialNumber"
      },
      productName: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "productName"
      },
      source: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "source"
      },
      model: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "model"
      },
      engProductName: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "engProductName"
      },
      status: {
        type: Sequelize.STRING(100),
        allowNull: false,
        field: "status"
      },
      brand: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "brand"
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "category"
      },
      acquiredType: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "acquiredType"
      },
      type: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "type"
      },
      unit: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "unit"
      },
      quantity: {
        type: Sequelize.INTEGER(10),
        allowNull: true,
        field: "quantity"
      },
      kind: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "kind"
      },
      group: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "group"
      },
      guaranteedMonth: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "guaranteedMonth"
      },
      purposeOfUse: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "purposeOfUse"
      },
      allSector: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "allSector"
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "department"
      },
      insuranceStartDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "insuranceStartDate"
      },
      insuranceExpiredDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "insuranceExpiredDate"
      },
      sector: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "sector"
      },
      sendDocument: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "sendDocument"
      },
      guarantee: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "guarantee"
      },
      size: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "size"
      },
      assetGroupNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "assetGroupNumber"
      },
      asset01: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "asset01"
      },
      replacedAssetNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "replacedAssetNumber"
      },
      pricePerUnit: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "pricePerUnit"
      },

      //ค่าเสื่อม
      depreciationStartDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "insuranceExpiredDate"
      },
      depreciationRegisterDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "insuranceExpiredDate"
      },
      depreciationReceivedDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "insuranceExpiredDate"
      },
      depreciationPrice: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "depreciationPrice"
      },
      depreciationYearUsed: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "depreciationYearUsed"
      },
      depreciationCarcassPrice: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "depreciationCarcassPrice"
      },
      depreciationProcess: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "depreciationProcess"
      },
      depreciationPresentMonth: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "depreciationPresentMonth"
      },
      depreciationCumulativePrice: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "depreciationCumulativePrice"
      },
      depreciationYearPrice: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "depreciationYearPrice"
      },
      depreciationRemainPrice: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "depreciationRemainPrice"
      },
      depreciationBookValue: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "depreciationBookValue"
      },
      // ค่าเสื่อมรายปี
      accumulateDepreciationStartDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "accumulateDepreciationStartDate"
      },
      accumulateDepreciationRegisterDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "accumulateDepreciationRegisterDate"
      },
      accumulateDepreciationReceivedDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "accumulateDepreciationReceivedDate"
      },
      accumulateDepreciationPrice: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "accumulateDepreciationPrice"
      },
      accumulateDepreciationYearUsed: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "accumulateDepreciationYearUsed"
      },
      accumulateDepreciationCarcassPrice: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "accumulateDepreciationCarcassPrice"
      },
      accumulateDepreciationProcess: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "accumulateDepreciationProcess"
      },
      accumulateDepreciationPresentMonth: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "accumulateDepreciationPresentMonth"
      },
      accumulateDepreciationCumulativePrice: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "accumulateDepreciationCumulativePrice"
      },
      accumulateDepreciationYearPrice: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "accumulateDepreciationYearPrice"
      },
      accumulateDepreciationRemainPrice: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "accumulateDepreciationRemainPrice"
      },
      accumulateDepreciationBookValue: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "accumulateDepreciationBookValue"
      },
      // // assetPic
      // imageArray: [{ image: String }],

      // // document
      // documentArray: [{ document: String }],
      // //genData for draft
      // genDataArray: [
      //   {
      //     assetNumber: String,
      //     serialNumber: String,
      //     replacedAssetNumber: String,
      //     asset01: String,
      //     sector: String,
      //   },
      // ],
      reserved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: "reserved"
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "deletedAt"
      },
      // purchaseContract: purchaseContractSchema,
      // distribution: distributionSchema,

      packageAssetId: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
        field: "packageAssetId"
      },

      delereasontedAt: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "reason"
      },

      //สัญญาจัดซื้อ
      acquisitionMethod: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "acquisitionMethod"
      },
      moneyType: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "moneyType"
      },
      deliveryDocument: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "deliveryDocument"
      },
      contractNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "contractNumber"
      },
      receivedDate: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "receivedDate"
      },
      seller: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "seller"
      },
      price: {
        type: Sequelize.INTEGER(100),
        allowNull: true,
        field: "price"
      },
      billNumber: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "billNumber"
      },
      purchaseYear: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "purchaseYear"
      },
      purchaseDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "purchaseDate"
      },
      documentDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "documentDate"
      },
      //จำหน่าย
      salesDocument: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "salesDocument"
      },
      distributeDocumentDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "distributeDocumentDate"
      },
      distributeApprovalReleaseDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "distributeApprovalReleaseDate"
      },
      distributeStatus: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "distributeStatus"
      },
      distributionNote: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: "distributionNote"
      }
    },
    {
      tableName: "TB_ASSETS"
    }
  );

  return asset;
};
