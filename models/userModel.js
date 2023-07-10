module.exports = (sequelize, Sequelize) => {
  const user = sequelize.define(
    "TB_USERS",
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
      thaiPrefix: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "thaiPrefix",
      },
      thaiFirstName: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "thaiPrefix",
      },
      thaiLastName: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "thaiLastName",
      },
      engPrefix: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "engPrefix",
      },
      engFirstName: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "engFirstName",
      },
      engLastName: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "engLastName",
      },
      thaiFirstName: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "thaiPrefix",
      },
      idCard: {
        type: Sequelize.STRING(20),
        allowNull: false,
        field: "idCard",
      },
      sex: {
        type: Sequelize.STRING(10),
        allowNull: false,
        field: "sex",
      },
      birthDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "birthDate",
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
        field: "password",
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "username",
      },
      passwordStartDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "passwordStartDate",
      },
      passwordEndDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "passwordEndDate",
      },
      employeeId: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "employeeId",
      },
      professionalLicenseNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "professionalLicenseNumber",
      },
      sector: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "sector",
      },
      medicalBranchCode: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "medicalBranchCode",
      },
      thaiPosition: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "thaiPosition",
      },
      engPosition: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "engPosition",
      },
      personnelTypeCode: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "personnelTypeCode",
      },
      hospital: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "hospital",
      },
      fromHospital: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "fromHospital",
      },

      toHospital: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "toHospital",
      },
      houseNo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "houseNo",
      },
      villageNo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "villageNo",
      },
      soi: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "soi",
      },
      separatedSoi: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "separatedSoi",
      },
      road: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "road",
      },
      village: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "village",
      },
      district: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "district",
      },
      subdistrict: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "subdistrict",
      },
      province: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "province",
      },
      zipcode: {
        type: Sequelize.STRING(5),
        allowNull: false,
        field: "zipcode",
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "email",
      },
      phoneNumber: {
        type: Sequelize.STRING(10),
        allowNull: false,
        field: "phoneNumber",
      },
      homePhoneNumber: {
        type: Sequelize.STRING(10),
        allowNull: false,
        field: "homePhoneNumber",
      },
      lineId: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "lineId",
      },
      facebook: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "facebook",
      },
      docterType: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "docterType",
      },
      medicalField: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "medicalField",
      },
      dateTimeRecord: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "dateTimeRecord",
      },
      dateTimeModify: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "dateTimeModify",
      },
      dateTimeUpdatePassword: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "dateTimeUpdatePassword",
      },
      userEndDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "userEndDate",
      },
      PACSDateTime: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "PACSDateTime",
      },
      lastRevisionDateTime: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "lastRevisionDateTime",
      },
      note: {
        type: Sequelize.STRING(1000),
        allowNull: true,
        field: "note",
      },
      lastLoginDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "lastLoginDate",
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: "status",
        default: "active",
      },
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
      tableName: "TB_USERS",
    }
  );

  return user;
};
