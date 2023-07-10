module.exports = (sequelize, Sequelize) => {
  const merchant = sequelize.define(
    "TB_MERCHANTS",
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
      realMerchantId: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "realMerchantId",
      },
      companyPrefix: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "companyPrefix",
      },
      companyName: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "companyName",
      },
      prefix: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "prefix",
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "name",
      },
      phoneNumber: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "phoneNumber",
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "email",
      },
      paymentTerm: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "paymentTerm",
      },
      contactName: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "contactName",
      },
      bankAccountNumber: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "bankAccountNumber",
      },
      bankAccountDetail: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "bankAccountDetail",
      },
      bankCode: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "bankCode",
      },
      bankBranchCode: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "bankBranchCode",
      },
      taxpayerNumber: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "taxpayerNumber",
      },
      idCardNumber: {
        type: Sequelize.STRING(15),
        allowNull: true,
        field: "idCardNumber",
      },
      creditorCategory: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "creditorCategory",
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "status",
      },
      // dateTime_approver: {
      //   type: Sequelize.DATE,
      //   allowNull: true,
      //   field: "dateTime_approver",
      // },
      reason: {
        type: Sequelize.STRING(1000),
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
      tableName: "TB_MERCHANTS",
    }
  );

  return merchant;
};
