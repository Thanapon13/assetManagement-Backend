module.exports = (sequelize, Sequelize) => {
  const subComponentBorrow = sequelize.define(
    "TB_SUB_COMPONENT_BORROWS",
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
        allowNull: true,
        field: "assetNumber",
      },
      isPackage: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        field: "isPackage",
      },
      productName: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "productName",
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: "amount",
      },
    },

    {
      tableName: "TB_SUB_COMPONENT_BORROWS",
    }
  );

  return subComponentBorrow;
};
