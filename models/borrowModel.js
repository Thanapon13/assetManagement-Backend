module.exports = (sequelize, Sequelize) => {
  const borrow = sequelize.define(
    "TB_BORROWS",
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
      borrowIdDoc: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "borrowIdDoc",
      },
      pricePerDay: {
        type: Sequelize.INTEGER(50),
        allowNull: false,
        field: "pricePerDay",
      },
      borrowDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "borrowDate",
      },
      borrowReturnDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "borrowReturnDate",
      },
      borrowSetReturnDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "borrowSetReturnDate",
      },
      sector: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "sector",
      },
      subSector: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "subSector",
      },
      borrowPurpose: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "borrowPurpose",
      },
      handler: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "handler",
      },
      building: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "building",
      },
      floor: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "floor",
      },
      room: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "room",
      },
      name_recorder: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "name_recorder",
      },
      dateTime_recorder: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "dateTime_recorder",
      },
      name_courier: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "dateTime_recorder",
      },
      dateTime_courier: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "dateTime_recorder",
      },
      name_approver: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "dateTime_recorder",
      },
      dateTime_approver: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "dateTime_recorder",
      },
      reason: {
        type: Sequelize.STRING(1000),
        allowNull: false,
        field: "dateTime_recorder",
      },
      note: {
        type: Sequelize.STRING(1000),
        allowNull: false,
        field: "dateTime_recorder",
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "dateTime_recorder",
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "dateTime_recorder",
      },
    
    },
    {
      tableName: "TB_BORROWS",
    }
  );

  return borrow;
};
