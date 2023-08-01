module.exports = (sequelize, Sequelize) => {
  const costOfRepairMan = sequelize.define(
    "TB_COST_OF_REPAIR_MANS",
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
      name: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "name",
      },
      workPerHour: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: "workPerHour",
      },
      ratePerHour: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: "ratePerHour",
      },
      totalEarn: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: "totalEarn",
      },
      amountExtra: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: "amountExtra",
      },
    },
    {
      tableName: "TB_COST_OF_REPAIR_MANS",
    }
  );

  return costOfRepairMan;
};
