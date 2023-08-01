module.exports = (sequelize, Sequelize) => {
  const costOfRepair = sequelize.define(
    "TB_COST_OF_REPAIRS",
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
      stuffName: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "stuffName",
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: "quantity",
      },
      unit: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "unit",
      },
      pricePerPiece: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: "pricePerPiece",
      },
    },
    {
      tableName: "TB_COST_OF_REPAIRS",
    }
  );

  return costOfRepair;
};
