const { Sequelize } = require("sequelize");

//อันนี้เป็นส่วนที่ใช้ในการบอก Sequelize ว่าเราจะ connect ไปที่ไหน
const sequelize = new Sequelize(
  "asset-management", // นี่เป็นชื่อ DB ของเรานะครับ
  "Nanine", // user ที่ใช้สรการเข้าไปยัง db
  "123123", // password
  {
    host: "localhost", // host ของ db ที่เราสร้างเอาไว้
    dialect: "mssql", // 'mysql' | 'mariadb' | 'postgres' | 'mssql'   พวกนี้ใช่ก็ใช้ได้นะจ๊ะ
    define: {
      timestamps: true, //ส่วนตรงนี้ก็เป็นการตั้งค่าเพิ่มเติม
    },
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
db.purposeOfUse = require("./purposeOfUseModel")(sequelize, Sequelize);
db.repairSector = require("./repairSectorModel")(sequelize, Sequelize);
db.room = require("./roomModel")(sequelize, Sequelize);
db.sector = require("./sectorModel")(sequelize, Sequelize);
db.source = require("./sourceModel")(sequelize, Sequelize);
db.subComponentAsset = require("./subComponentAssetModel")(
  sequelize,
  Sequelize
);
db.subSecter = require("./subSectorModel")(sequelize, Sequelize);
db.thaiPrefix = require("./thaiPrefixModel")(sequelize, Sequelize);
db.type4 = require("./type4Model")(sequelize, Sequelize);
db.type8 = require("./type8Model")(sequelize, Sequelize);
db.type13 = require("./type13Model")(sequelize, Sequelize);
db.type = require("./typeModel")(sequelize, Sequelize);

// db.room = require("./roomModel")(sequelize, Sequelize);
//   db.team = require("./model/team")( sequelize , Sequelize );
//ส่วนนี้เป็นการตั้งต่า relation นะครับ โดยเป็นการบอกว่าใน 1 team มีได้หลาย player ง่ายๆ ก็คือ relation แบบ 1:M
db.floor.hasMany(db.room, {
  foreignKey: { name: "floorId", field: "floorId" },
  onDelete: "cascade",
});
db.building.hasMany(db.floor, {
  foreignKey: { name: "buildingId", field: "buildingId" },
  onDelete: "cascade",
});
db.asset.hasMany(db.subComponentAsset, {
  foreignKey: { name: "assetId", field: "assetId" },
  onDelete: "cascade",
});
db.asset.hasMany(db.assetDocument, {
  foreignKey: { name: "assetId", field: "assetId" },
  onDelete: "cascade",
});
db.asset.hasMany(db.assetImage, {
  foreignKey: { name: "assetId", field: "assetId" },
  onDelete: "cascade",
});
//name ตรงสำคัญพยายามตั่งให้เป็นชื่อเดียวกับ FK ใน table ที่นำไปใช้นะครับ

//ส่วนนี้เป็นการตั้ง relation แบบกลับกันกับด้านบน จริงแล้วเราไม่ตั้งก็ได้นะครับแต่ผมแนะนำให้ตั้งเอาไว้ เพราะเวลาที่เราไม่ได้ใส่
//line นี้จะทำให้เราสามารถใช้  team ในการหา player ได้อย่างเดียวและไม่สามารถใช้ player หา team ได้
db.floor.belongsTo(db.building, { foreignKey: "buildingId" });
db.room.belongsTo(db.floor, { foreignKey: "floorId" });
db.subComponentAsset.belongsTo(db.asset, { foreignKey: "assetId" });
db.assetDocument.belongsTo(db.asset, { foreignKey: "assetId" });
db.assetImage.belongsTo(db.asset, { foreignKey: "assetId" });

module.exports = db;
