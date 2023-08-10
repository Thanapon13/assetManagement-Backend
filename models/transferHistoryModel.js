module.exports = (sequelize, Sequelize) => {
  const transferHistory = sequelize.define(
    "TB_TRANSFER_HISTORIES",
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
      building: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "building",
      },
      room: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "room",
      },
      moveInDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "moveInDate",
      },
      moveOutDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "moveOutDate",
      },
    },
    {
      tableName: "TB_TRANSFER_HISTORIES",
    }
  );

  return transferHistory;
};
