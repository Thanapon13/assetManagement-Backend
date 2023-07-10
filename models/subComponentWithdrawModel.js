module.exports = (sequelize, Sequelize) => {
  const subComponentWithdraw = sequelize.define(
    "TB_SUB_COMPONENT_WITHDRAWS ",
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
      inventoryNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "inventoryNumber",
      },
      productName: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "productName",
      },
      brand: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "brand",
      },
      serialNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "serialNumber",
      },
      supplier: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "supplier",
      },
      amount: {
        type: Sequelize.INTEGER(50),
        allowNull: false,
        field: "amount",
      },
      price: {
        type: Sequelize.INTEGER(50),
        allowNull: false,
        field: "price",
      },
      
      // withdrawId: {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: "Withdraw",
      //   required: true,
      // },
      // assetId: {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: "Asset",
      //   required: true,
      // },
    },
   
    {
      tableName: "TB_SUB_COMPONENT_WITHDRAWS ",
    }
  );

  return subComponentWithdraw;
};
