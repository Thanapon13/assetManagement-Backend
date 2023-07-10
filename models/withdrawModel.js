module.exports = (sequelize, Sequelize) => {
  const withdraw = sequelize.define(
    "TB_WITHDRAWS",
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
      billNumber: {
        type: Sequelize.STRING(100),
        allowNull: false,
        billNumber: "billNumber",
      },
      sector: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "sector",
      },
      eligiblePerson: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "eligiblePerson",
      },
      withdrawDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "withdrawDate",
      },
      note: {
        type: Sequelize.STRING(1000),
        allowNull: true,
        field: "note",
      },
      allPrice: {
        type: Sequelize.INTEGER(50),
        allowNull: true,
        field: "allPrice",
      },
      firstName_recorder: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "firstName_recorder",
      },
      lastName_recorder: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "lastName_recorder",
      },
      dateTime_recorder: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "dateTime_recorder",
      },

      firstName_courier: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "firstName_courier",
      },
      lastName_courier: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "lastName_courier",
      },
      dateTime_courier: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "dateTime_courier",
      },
      firstName_approver: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "firstName_approver",
      },
      lastName_approver: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "lastName_approver",
      },
      dateTime_approver: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "dateTime_approver",
      },
    },
    {
      tableName: "TB_WITHDRAWS",
    }
  );

  return withdraw;
};
// withdrawSchema.pre("remove", async function (next) {
//   try {
//     let subComponentAssetWithdraw = await SubComponentAssetWithdraw.deleteMany({
//       withdrawId: {
//         $in: this.id,
//       },
//     });
//     console.log(subComponentAssetWithdraw, "delete subComponentAssetWithdraw");

//     next();
//   } catch (err) {
//     next(err);
//   }
// });
