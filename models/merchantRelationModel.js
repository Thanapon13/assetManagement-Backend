module.exports = (sequelize, Sequelize) => {
  const merchantRelation = sequelize.define(
    "TB_MERCHANT_RELATIONS",
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
      companyCategory: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "companyCategory",
      },
      remark: {
        type: Sequelize.STRING(1000),
        allowNull: true,
        field: "remark",
      },
    },
    {
      tableName: "TB_MERCHANT_RELATIONS",
    }
  );

  return merchantRelation;
};
