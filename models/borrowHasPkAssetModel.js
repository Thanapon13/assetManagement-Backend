module.exports = (sequelize, Sequelize) => {
  const borrowHasPkAsset = sequelize.define(
    "TB_BORROW_HAS_PACKAGE_ASSETS",
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
      reason: {
        type: Sequelize.STRING(1000),
        allowNull: true,
        defaultValue: "",
        field: "reason",
      },
      return: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "return",
      },
      returnDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "returnDate",
      },
    },
    {
      tableName: "TB_BORROW_HAS_PACKAGE_ASSETS",
    }
  );

  return borrowHasPkAsset;
};
