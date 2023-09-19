module.exports = (sequelize, Sequelize) => {
  const bottomSubComponentPkAsset = sequelize.define(
    "TB_BOTTOM_SUB_COMPONENT_PACKAGE_ASSETS",
    {
      // ด้านล่างเป็นการตั้งค่า attribute ของ table นะครับ
      // ชื่อตัวแปรที่เราใช้เรียกแทน: { type: Sequelize.STRING(50), allowNull: false, field: 'ชื่อของ attribute' }
      // สามารถใส่ option เพิ่มเติมได้นะครับเช่น primaryKey: true อะไรแบบนี้
      // แล้วก็อันนี้สำคัญ ** ไม่จำเป็นต้องสร้าง attribute ที่เป็น FK จาก table อื่นนะครับ เพราะเราจะไปกำหนด relation กันใน file index
      _id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        field: "_id",
      },
      serialNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "serialNumber",
      },
      productName: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "productName",
      },
      assetNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "assetNumber",
      },
      sector: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "sector",
      },
      price: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "price",
      },
      asset01: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "asset01",
      },
    },
    {
      tableName: "TB_BOTTOM_SUB_COMPONENT_PACKAGE_ASSETS",
    }
  );

  return bottomSubComponentPkAsset;
};
