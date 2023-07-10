module.exports = (sequelize, Sequelize) => {
  const merchantAddress = sequelize.define(
    "TB_MERCHANT_ADDRESSES",
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
      address: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "address",
      },
      group: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "group",
      },
      village: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "village",
      },
      alley: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "alley",
      },
      street: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "street",
      },
      province: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "province",
      },
      district: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "district",
      },
      subDistrict: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "subDistrict",
      },
      postalCode: {
        type: Sequelize.STRING(5),
        allowNull: true,
        field: "postalCode",
      },
    },
    {
      tableName: "TB_MERCHANT_ADDRESSES",
    }
  );

  return merchantAddress;
};
