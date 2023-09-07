const asset = require("./index").asset;
module.exports = (sequelize, Sequelize) => {
  const repair = sequelize.define(
    "TB_REPAIRS",
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
      informRepairIdDoc: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "informRepairIdDoc",
      },
      urgentStatus: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "urgentStatus",
      },
      informRepairDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "informRepairDate",
      },
      assetNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "assetNumber",
      },
      isInsurance: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        field: "isInsurance",
      },
      assetGroupNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "assetGroupNumber",
      },
      hostSector: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "hostSector",
      },
      productName: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "productName",
      },
      insuranceStartDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "insuranceStartDate",
      },
      insuranceEndDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "insuranceEndDate",
      },
      costCenterCode: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "costCenterCode",
      },
      asset01: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "asset01",
      },
      building: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "building",
      },
      floor: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "floor",
      },
      room: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "room",
      },
      // ข้อมูลผู้เกี่ยวข้อง
      name_recorder: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "name_recorder",
      },
      phoneNumber: {
        type: Sequelize.STRING(15),
        allowNull: true,
        field: "phoneNumber",
      },
      name_courier: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "name_courier",
      },
      courierSector: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "courierSector",
      },
      repairMan: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "repairMan",
      },
      // รายละเอียดการซ่อม
      typeOfRepair: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "typeOfRepair",
      },
      repairSector: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "repairSector",
      },
      //วันที่- เวลาซ่อม
      assignDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "assignDate",
      },
      arriveAtPlaceDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "arriveAtPlaceDate",
      },
      workDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "workDate",
      },
      repairedDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "repairedDate",
      },
      //ผลการซ่อม
      repairResult: {
        type: Sequelize.STRING(1000),
        allowNull: true,
        field: "repairResult",
      },
      statusOutsourceRepair: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "statusOutsourceRepair",
      },
      mechinicComment: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "mechinicComment",
      },
      //เปิดใบจ้างซ่อมภายนอก
      outSourceRepairNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "outSourceRepairNumber",
      },
      repairSectorRefNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "repairSectorRefNumber",
      },
      repairDateCreateOutsourceRepair: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "repairDateCreateOutsourceRepair",
      },
      descriptionCreateOutsourceRepair: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: "descriptionCreateOutsourceRepair",
      },
      //ผู้รับผิดชอบ
      responsibleName: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "responsibleName",
      },
      approveDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "approveDate",
      },
      bookNumber: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "respobookNumbernsibleName",
      },
      approveDateOfDelivery: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "approveDateOfDelivery",
      },
      deliverDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "deliverDate",
      },
      contractorName: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "contractorName",
      },
      responsibleAddress: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "responsibleAddress",
      },
      responsiblePhone: {
        type: Sequelize.STRING(15),
        allowNull: true,
        field: "responsiblePhone",
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: "price",
      },
      contactName: {
        type: Sequelize.STRING(15),
        allowNull: true,
        field: "contactName",
      },
      tax: {
        type: Sequelize.STRING(15),
        allowNull: true,
        field: "tax",
      },
      responsibleRemark: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "responsibleRemark",
      },
      totalPrice: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: "totalPrice",
      },
      //ข้อมูลตรวจรับงาน
      checkJobReceiptNumber: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "checkJobReceiptNumber",
      },
      statusCheckJob: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "statusCheckJob",
      },
      approveHireDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "approveHireDate",
      },
      checkJobDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "checkJobDate",
      },
      hireNumber: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "hireNumber",
      },
      sendWithDrawMoneyDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "sendWithDrawMoneyDate",
      },
      receiveWorkOrderDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "receiveWorkOrderDate",
      },
      checkJobInsuranceEndDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "checkJobInsuranceEndDate",
      },

      checkJobWarrantyPeriod: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: "checkJobWarrantyPeriod",
      },
      purchaseAmount: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: "purchaseAmount",
      },
      outsourceFlag: {
        type: Sequelize.STRING(1),
        allowNull: true,
        field: "outsourceFlag",
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "status",
      },
      statusOfDetailRecord: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: "statusOfDetailRecord",
      },
      dateTime_approver: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "dateTime_approver",
      },
      dateTime_waitingApprover: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "dateTime_waitingApprover",
      },
      reason: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: "reason",
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "deletedAt",
      },
      // assetId: {
      //   type: Sequelize.UUID,
      //   allowNull: false,
      //   references: {
      //     model: "TB_ASSETS",
      //     key: "_id",
      //   },
      // },
    },
    {
      tableName: "TB_REPAIRS",
    }
  );

  return repair;
};
