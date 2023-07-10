module.exports = (sequelize, Sequelize) => {
  const building = sequelize.define(
    "TBM_BUILDINGS",
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
        allowNull: false,
        unique: true,
        field: "name",
      },
    },
    {
      tableName: "TBM_BUILDINGS",
    }
  );
  // buildingSchema.pre("remove", async function (next) {
  //   try {
  //     let floorIdArray = await Floor.find({
  //       buildingId: {
  //         $in: this.id,
  //       },
  //     }).select("_id");
  //     console.log(floorIdArray);

  //     let room = await Room.deleteMany({
  //       floorId: {
  //         $in: floorIdArray,
  //       },
  //     });
  //     console.log(room, "delete room");

  //     let floor = await Floor.deleteMany({
  //       buildingId: {
  //         $in: this.id,
  //       },
  //     });
  //     console.log(floor, "delete floor");
  //     next();
  //   } catch (err) {
  //     next(err);
  //   }
  // });
  return building;
};
