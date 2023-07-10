module.exports = (sequelize, Sequelize) => {
  const subComponentAsset = sequelize.define(
    "TB_SUB_COMPONENT_ASSETS ",
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
      assetNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "assetNumber",
      },
      serialNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "serialNumber",
      },
      replacedAssetNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "replacedAssetNumber",
      },
      asset01: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "asset01",
      },
      sector: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "sector",
      },
      // floorId: {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: "Floor",
      //   required: true,
      // },
    },
    {
      tableName: "TB_SUB_COMPONENT_ASSETS ",
    }
  );

  return subComponentAsset;
};
