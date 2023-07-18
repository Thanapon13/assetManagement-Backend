module.exports = (sequelize, Sequelize) => {
  const transfer = sequelize.define(
    "TB_TRANSFERS",
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
      transferSector: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "transferSector",
      },
      subSector: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "subSector",
      },
      transfereeSector: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        field: "transfereeSector",
      },
      building: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "building",
      },
      floor: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "floor",
      },
      room: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "room",
      },
      name_recorder: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "name_recorder",
      },
      dateTime_recorder: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "dateTime_recorder",
      },
      name_courier: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "name_courier",
      },
      dateTime_courier: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "dateTime_courier",
      },
      name_approver: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "name_approver",
      },
      dateTime_approver: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "dateTime_approver",
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "status",
      },
     
      reason: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "reason",
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "deletedAt",
      },
    },
    {
      tableName: "TB_TRANSFERS",
    }
  );

  return transfer;
};
