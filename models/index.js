const { Sequelize } = require("sequelize");

//อันนี้เป็นส่วนที่ใช้ในการบอก Sequelize ว่าเราจะ connect ไปที่ไหน
const sequelize = new Sequelize(
  process.env.DB_NAME, // นี่เป็นชื่อ DB ของเรานะครับ
  process.env.DB_USERNAME, // user ที่ใช้สรการเข้าไปยัง db
  process.env.DB_PASSWORD, // password
  {
    host: process.env.DB_HOST, // host ของ db ที่เราสร้างเอาไว้
    dialect: "mssql", // 'mysql' | 'mariadb' | 'postgres' | 'mssql'   พวกนี้ใช่ก็ใช้ได้นะจ๊ะ
    define: {
      timestamps: true //ส่วนตรงนี้ก็เป็นการตั้งค่าเพิ่มเติม
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//ส่วนนี้เป็นการ import model ของ table ใน database เข้ามาเพื่อตั้งต่า relation นะครับ

// db.accessScreen = require("./accessScreenModel")(sequelize, Sequelize);
db.acquiredType = require("./acquiredTypeModel")(sequelize, Sequelize);
db.acquisitionMethod = require("./acquisitionMethodModel")(
  sequelize,
  Sequelize
);
db.assetDocument = require("./assetDocumentModel")(sequelize, Sequelize);
db.assetImage = require("./assetImageModel")(sequelize, Sequelize);
db.asset = require("./assetModel")(sequelize, Sequelize);
db.borrowHasAsset = require("./borrowHasAssetModel")(sequelize, Sequelize);
db.borrowHasPkAsset = require("./borrowHasPkAssetModel")(sequelize, Sequelize);
db.borrowImage = require("./borrowImageModel")(sequelize, Sequelize);
db.borrow = require("./borrowModel")(sequelize, Sequelize);
db.bottomSubComponentDataPkAsset =
  require("./bottomSubComponentDataPkAssetModel")(sequelize, Sequelize);
db.borrowPurpose = require("./borrowPurposeModel")(sequelize, Sequelize);
db.brand = require("./brandModel")(sequelize, Sequelize);
db.building = require("./buildingModel")(sequelize, Sequelize);
db.category = require("./categoryModel")(sequelize, Sequelize);
db.companyPrefix = require("./companyPrefixModel")(sequelize, Sequelize);
db.countingUnit = require("./countingUnitModel")(sequelize, Sequelize);
db.department = require("./departmentModel")(sequelize, Sequelize);
db.docterType = require("./docterTypeModel")(sequelize, Sequelize);
db.engPrefix = require("./engPrefixModel")(sequelize, Sequelize);
db.floor = require("./floorModel")(sequelize, Sequelize);
db.group = require("./groupModel")(sequelize, Sequelize);
db.personnelTypeCode = require("./personnelTypeCodeModel")(
  sequelize,
  Sequelize
);
db.pkAssetDocument = require("./pkAssetDocumentModel")(sequelize, Sequelize);
db.pkAssetImage = require("./pkAssetImageModel")(sequelize, Sequelize);
db.pkAsset = require("./pkAssetModel")(sequelize, Sequelize);
db.purposeOfUse = require("./purposeOfUseModel")(sequelize, Sequelize);
db.repairSector = require("./repairSectorModel")(sequelize, Sequelize);
db.room = require("./roomModel")(sequelize, Sequelize);
db.sector = require("./sectorModel")(sequelize, Sequelize);
db.source = require("./sourceModel")(sequelize, Sequelize);
db.subComponentTransfer = require("./subComponentTransferModel")(
  sequelize,
  Sequelize
);
db.subComponentAsset = require("./subComponentAssetModel")(
  sequelize,
  Sequelize
);
db.subComponentPkAsset = require("./subComponentPkAssetModel ")(
  sequelize,
  Sequelize
);
db.subComponentBorrow = require("./subComponentBorrowModel")(
  sequelize,
  Sequelize
);
db.subSecter = require("./subSectorModel")(sequelize, Sequelize);
db.thaiPrefix = require("./thaiPrefixModel")(sequelize, Sequelize);
db.transferHasAsset = require("./transferHasAssetModel")(sequelize, Sequelize);
db.transferHasPkAsset = require("./transferHasPkAssetModel")(
  sequelize,
  Sequelize
);
db.transfer = require("./transferModel")(sequelize, Sequelize);
db.type4 = require("./type4Model")(sequelize, Sequelize);
db.type8 = require("./type8Model")(sequelize, Sequelize);
db.type13 = require("./type13Model")(sequelize, Sequelize);
db.type = require("./typeModel")(sequelize, Sequelize);
db.merchant = require("./merchantModel")(sequelize, Sequelize);
db.merchantAddress = require("./merchantAddressModel")(sequelize, Sequelize);
db.merchantRelation = require("./merchantRelationModel")(sequelize, Sequelize);
db.merchantDocumentArray = require("./merchantDocumentArrayModel")(
  sequelize,
  Sequelize
);
db.user = require("./userModel")(sequelize, Sequelize);
db.role = require("./roleModel")(sequelize, Sequelize);
db.accessScreen = require("./accessScreenModel")(sequelize, Sequelize);

// db.room = require("./roomModel")(sequelize, Sequelize);
//   db.team = require("./model/team")( sequelize , Sequelize );
//ส่วนนี้เป็นการตั้งต่า relation นะครับ โดยเป็นการบอกว่าใน 1 team มีได้หลาย player ง่ายๆ ก็คือ relation แบบ 1:M
db.floor.hasMany(db.room, {
  as: "rooms",
  foreignKey: { name: "floorId", field: "floorId" },
  onDelete: "cascade"
});
db.building.hasMany(db.floor, {
  as: "floors",
  foreignKey: { name: "buildingId", field: "buildingId" },
  onDelete: "cascade"
});
db.asset.hasMany(db.subComponentAsset, {
  as: "subComponentAssets",
  foreignKey: { name: "assetId", field: "assetId" },
  onDelete: "cascade"
});
db.asset.hasMany(db.assetDocument, {
  as: "assetDocuments",
  foreignKey: { name: "assetId", field: "assetId" },
  onDelete: "cascade"
});
db.asset.hasMany(db.assetImage, {
  as: "assetImages",
  foreignKey: { name: "assetId", field: "assetId" },
  onDelete: "cascade"
});
db.borrow.hasMany(db.borrowHasAsset, {
  as: "borrowHasAssets",
  foreignKey: { name: "borrowId", field: "borrowId" },
  onDelete: "cascade"
});
db.borrow.hasMany(db.borrowHasPkAsset, {
  as: "borrowHasPkAssets",
  foreignKey: { name: "borrowId", field: "borrowId" },
  onDelete: "cascade"
});
db.borrow.hasMany(db.borrowImage, {
  as: "borrowImages",
  foreignKey: { name: "borrowId", field: "borrowId" },
  onDelete: "cascade"
});
db.borrow.hasMany(db.subComponentBorrow, {
  as: "subComponentBorrows",
  foreignKey: { name: "borrowId", field: "borrowId" },
  onDelete: "cascade"
});

db.pkAsset.hasMany(db.asset, {
  as: "assets",
  foreignKey: { name: "packageAssetId", field: "packageAssetId" },
  onDelete: "cascade"
});
db.pkAsset.hasMany(db.pkAssetDocument, {
  as: "packageAssetDocuments",
  foreignKey: { name: "packageAssetId", field: "packageAssetId" },
  onDelete: "cascade"
});
db.pkAsset.hasMany(db.pkAssetImage, {
  as: "packageAssetImages",
  foreignKey: { name: "packageAssetId", field: "packageAssetId" },
  onDelete: "cascade"
});
db.pkAsset.hasMany(db.subComponentPkAsset, {
  as: "subComponentPackageAssets",
  foreignKey: { name: "packageAssetId", field: "packageAssetId" },
  onDelete: "cascade"
});
db.pkAsset.hasMany(db.bottomSubComponentDataPkAsset, {
  as: "bottomSubComponentDataPackageAssets",
  foreignKey: { name: "packageAssetId", field: "packageAssetId" },
  onDelete: "cascade"
});

////  feat : transfer
db.transfer.hasMany(db.subComponentTransfer, {
  as: "subComponentTransfers",
  foreignKey: { name: "transferId", field: "transferId" },
  onDelete: "cascade"
});
db.transfer.hasMany(db.transferHasAsset, {
  as: "transferHasAssets",
  foreignKey: { name: "transferId", field: "transferId" },
  onDelete: "cascade"
});
db.transfer.hasMany(db.transferHasPkAsset, {
  as: "transferHasPkAssets",
  foreignKey: { name: "transferId", field: "transferId" },
  onDelete: "cascade"
});
db.asset.hasMany(db.transferHasAsset, {
  as: "transferHasAssets",
  foreignKey: { name: "assetId", field: "assetId" },
  onDelete: "cascade"
});
db.pkAsset.hasMany(db.transferHasPkAsset, {
  as: "transferHasPkAssetsData",
  foreignKey: { name: "packageAssetId", field: "packageAssetId" },
  onDelete: "cascade"
});

// feat : merchant
db.merchant.hasMany(db.merchantAddress, {
  as: "merchantAddress",
  foreignKey: { name: "merchantId", field: "merchantId" },
  onDelete: "cascade"
});
db.merchant.hasMany(db.merchantRelation, {
  as: "merchantRelation",
  foreignKey: { name: "merchantId", field: "merchantId" },
  onDelete: "cascade"
});
db.merchant.hasMany(db.merchantDocumentArray, {
  as: "merchantDocumentArray",
  foreignKey: { name: "merchantId", field: "merchantId" },
  onDelete: "cascade"
});

// feat : User
db.user.hasMany(db.accessScreen, {
  as: "userAccessScreen",
  foreignKey: { name: "userId", field: "userId" },
  onDelete: "cascade"
});
db.user.hasMany(db.role, {
  as: "userRole",
  foreignKey: { name: "userId", field: "userId" },
  onDelete: "cascade"
});

// feat : Role
// db.role.hasMany(db.user, {
//   as: "roleId",
//   foreignKey: { name: "roleId", field: "roleId" }
// });

//name ตรงสำคัญพยายามตั่งให้เป็นชื่อเดียวกับ FK ใน table ที่นำไปใช้นะครับ

//ส่วนนี้เป็นการตั้ง relation แบบกลับกันกับด้านบน จริงแล้วเราไม่ตั้งก็ได้นะครับแต่ผมแนะนำให้ตั้งเอาไว้ เพราะเวลาที่เราไม่ได้ใส่
//line นี้จะทำให้เราสามารถใช้  team ในการหา player ได้อย่างเดียวและไม่สามารถใช้ player หา team ได้
db.floor.belongsTo(db.building, { foreignKey: "buildingId" });
db.room.belongsTo(db.floor, { foreignKey: "floorId" });
db.subComponentAsset.belongsTo(db.asset, { foreignKey: "assetId" });
db.assetDocument.belongsTo(db.asset, { foreignKey: "assetId" });
db.assetImage.belongsTo(db.asset, { foreignKey: "assetId" });
db.asset.belongsTo(db.pkAsset, { foreignKey: "packageAssetId" });
db.borrowHasAsset.belongsTo(db.borrow, { foreignKey: "borrowId" });
db.borrowHasPkAsset.belongsTo(db.borrow, { foreignKey: "borrowId" });
db.borrowImage.belongsTo(db.borrow, { foreignKey: "borrowId" });
db.subComponentBorrow.belongsTo(db.borrow, { foreignKey: "borrowId" });
db.pkAssetDocument.belongsTo(db.pkAsset, { foreignKey: "packageAssetId" });
db.pkAssetImage.belongsTo(db.pkAsset, { foreignKey: "packageAssetId" });
db.subComponentPkAsset.belongsTo(db.pkAsset, { foreignKey: "packageAssetId" });
db.bottomSubComponentDataPkAsset.belongsTo(db.pkAsset, {
  foreignKey: "packageAssetId"
});
db.subComponentTransfer.belongsTo(db.transfer, {
  foreignKey: "transferId"
});
db.transferHasAsset.belongsTo(db.transfer, {
  foreignKey: "transferId"
});
db.transferHasAsset.belongsTo(db.asset, {
  foreignKey: "assetId"
});
db.transferHasPkAsset.belongsTo(db.transfer, {
  foreignKey: "transferId"
});
db.transferHasPkAsset.belongsTo(db.pkAsset, {
  foreignKey: "packageAssetId"
});
db.merchantAddress.belongsTo(db.merchant, {
  foreignKey: "merchantId"
});
db.merchantRelation.belongsTo(db.merchant, {
  foreignKey: "merchantId"
});
db.merchantDocumentArray.belongsTo(db.merchant, {
  foreignKey: "merchantId"
});
db.accessScreen.belongsTo(db.user, {
  foreignKey: "userId"
});
db.role.belongsTo(db.user, {
  foreignKey: "userId"
});
// db.user.belongsTo(db.role, {
//   foreignKey: "roleId"
// });

// sequelize.sync({ force: true });
// console.log("All models were synchronized successfully.");
module.exports = db;
