const Borrow = require("../models").borrow;
const BorrowHasAsset = require("../models").borrowHasAsset;
const BorrowHasPkAsset = require("../models").borrowHasPkAsset;
const SubComponentBorrow = require("../models").subComponentBorrow;

const Asset = require("../models").asset;
const PackageAsset = require("../models").pkAsset;
const { Op } = require("sequelize");
const sequelize = require("sequelize");
const moment = require("moment/moment");
const { borrowHasPkAsset } = require("../models");
const BorrowImage = require("../models").borrowImage;

function delete_file(path) {
  fs.unlink(path, (err) => {
    if (err) throw err;
    console.log(path + " was deleted");
  });
}

exports.createBorrow = async (req, res, next) => {
  try {
    const { input, saveAssetWithdrawTableArray } = req.body;

    const inputObject = JSON.parse(input);
    console.log(inputObject);
    const saveAssetWithdrawTableArrayObject = JSON.parse(
      saveAssetWithdrawTableArray
    );
    let {
      borrowIdDoc,
      pricePerDay,
      borrowDate,
      borrowSetReturnDate,
      sector,
      subSector,
      borrowPurpose,
      handler,
      building,
      floor,
      room,
      name_recorder,
      dateTime_recorder,
      name_courier,
      dateTime_courier,
      name_approver,
      dateTime_approver,
      status,
    } = inputObject;

    console.log(
      "saveAssetWithdrawTableArrayObject",
      saveAssetWithdrawTableArrayObject
    );
    let newestBorrowIdDoc;
    let newestBorrow = await Borrow.findOne({
      order: [["createdAt", "DESC"]],
      attributes: ["_id", "borrowIdDoc"],
    });
    // .sort([["createdAt", -1]])
    // .select("borrowIdDoc");
    console.log("newestBorrow", newestBorrow);
    if (newestBorrow == null) {
      newestBorrowIdDoc = 0;
    } else {
      newestBorrowIdDoc = parseInt(newestBorrow.borrowIdDoc);
    }
    // for store in borrow schema

    // for query
    let assetIdHasAssetNumberArray = [];
    let packageAssetIdHasAssetNumberArray = [];
    let borrow;
    if (status == "saveDraft") {
      borrow = await Borrow.create({
        borrowIdDoc: newestBorrowIdDoc + 1,
        pricePerDay: pricePerDay,
        borrowDate: borrowDate,
        borrowSetReturnDate: borrowSetReturnDate,
        sector: sector,
        subSector: subSector,
        borrowPurpose: borrowPurpose,
        handler: handler,
        building: building,
        floor: floor,
        room: room,
        name_recorder: name_recorder,
        dateTime_recorder: new Date(),
        name_courier: name_recorder,
        dateTime_courier: new Date(),
        name_approver: name_approver,
        dateTime_approver: dateTime_approver,
        status: status,
        // assetWithDrawTableArray: saveAssetWithdrawTableArrayObject,
      });
      console.log("borrow:", borrow.dataValues._id);
      for (let i = 0; i < saveAssetWithdrawTableArrayObject.length; i++) {
        await SubComponentBorrow.create({
          borrowId: borrow.dataValues._id,
          assetNumber: saveAssetWithdrawTableArrayObject[i].assetNumber,
          isPackage: saveAssetWithdrawTableArrayObject[i].isPackage,
          productName: saveAssetWithdrawTableArrayObject[i].productName,
          amount: saveAssetWithdrawTableArrayObject[i].amount,
        });
      }
    } else {
      borrow = await Borrow.create({
        borrowIdDoc: newestBorrowIdDoc + 1,
        pricePerDay,
        borrowDate,
        borrowSetReturnDate,
        sector,
        subSector,
        borrowPurpose,
        handler,
        building,
        floor,
        room,
        name_recorder,
        dateTime_recorder: new Date(),
        name_courier: name_recorder,
        dateTime_courier: new Date(),
        name_approver,
        dateTime_approver,
        status: "waiting",
        // assetIdArray,
        // packageAssetIdArray,
      });
      for (let i = 0; i < saveAssetWithdrawTableArrayObject.length; i++) {
        // if have specific assetNumber
        if (saveAssetWithdrawTableArrayObject[i].assetNumber !== "") {
          if (saveAssetWithdrawTableArrayObject[i].isPackage) {
            // isPackage === true
            // console.log(1111);
            // console.log(saveAssetWithdrawTableArrayObject[i]);
            // let packageAsset = await PackageAsset.aggregate([
            //   {
            //     $match: {
            //       assetNumber: saveAssetWithdrawTableArrayObject[i].assetNumber,
            //       reserved: false,
            //       status: "inStock",
            //     },
            //   },
            //   {
            //     $lookup: {
            //       from: "assets",
            //       let: { packageAssetId: "$_id" }, // define a variable to store the PackageAsset _id
            //       pipeline: [
            //         {
            //           $match: {
            //             $expr: {
            //               $eq: ["$packageAssetId", "$$packageAssetId"], // reference the correct field name here
            //             },
            //           },
            //         },
            //         {
            //           $project: {
            //             _id: 1,
            //           },
            //         },
            //       ],
            //       as: "asset",
            //     },
            //   },
            // ]);
            let packageAsset = await PackageAsset.findAll({
              where: {
                [Op.and]: [
                  {
                    assetNumber:
                      saveAssetWithdrawTableArrayObject[i].assetNumber,
                  },
                  {
                    reserved: false,
                  },
                  {
                    status: "inStock",
                  },
                ],
              },
              include: [{ model: Asset, as: "assets", attributes: ["_id"] }],
            });
            console.log(111111111111);
            console.log(packageAsset);
            packageAssetIdHasAssetNumberArray.push(packageAsset[0]._id);

            await PackageAsset.update(
              { reserved: true },
              {
                where: {
                  assetNumber: saveAssetWithdrawTableArrayObject[i].assetNumber,
                },
              }
            );

            const packageAssetId = packageAsset[0]._id;
            // console.log(102,"packageAssetId",packageAssetId)
            // console.log("packageAsset.asset",packageAsset[0].asset)'

            if (packageAssetId) {
              await BorrowHasPkAsset.create({
                packageAssetId: packageAssetId,
                borrowId: borrow.dataValues._id,
              });
            }
            // packageAssetIdArray.push({ packageAssetId });

            if (packageAsset[0].asset.length > 0) {
              for (let k = 0; k < packageAsset[0].asset.length; k++) {
                // console.log(assetId)
                let assetId = packageAsset[0].asset[k]._id;
                console.log("assetId", assetId);
                let a = await Asset.update(
                  { reserved: true },

                  {
                    where: {
                      _id: assetId,
                    },
                  }
                );
                // console.log(a)
                // console.log(asset)
              }
            }

            // console.log("packageAssetId", packageAssetId);
          } else {
            // isPackage === false
            // console.log(22222);
            const asset = await Asset.findOne({
              where: {
                assetNumber: saveAssetWithdrawTableArrayObject[i].assetNumber,
              },
            });
            asset.reserved = true;
            await asset.save();

            assetIdHasAssetNumberArray.push(asset._id);
            console.log("assetasasdas", asset);
            const assetId = asset._id;
            await BorrowHasAsset.create({
              assetId: assetId,
              borrowId: borrow.dataValues._id,
            });
            // assetIdArray.push({ assetId });
            // console.log("assetId", assetId);
          }
        } else {
          // else not have specific assetNumber
          if (saveAssetWithdrawTableArrayObject[i].isPackage) {
            // isPackage === true
            // console.log(3333333333333);
            // console.log(saveAssetWithdrawTableArrayObject[i]);
            let packageAsset = await PackageAsset.findAll({
              where: {
                [Op.and]: [
                  {
                    productName:
                      saveAssetWithdrawTableArrayObject[i].productName,
                  },
                  { reserved: false },
                  { status: "inStock" },
                  {
                    _id: {
                      [Op.nin]: packageAssetIdHasAssetNumberArray, // not include in packageAssetIdHasAssetNumberArray that have contain packageAssetId that has assetNumber
                    },
                  },
                ],
              },
              include: [
                {
                  model: Asset,
                  require: false,

                  as: "assets",
                  attributes: ["_id"],
                },
              ],
              limit: +saveAssetWithdrawTableArrayObject[i].amount,
            });
            // let packageAsset = await PackageAsset.aggregate([
            //   {
            //     $match: {
            //       productName: saveAssetWithdrawTableArrayObject[i].productName,
            //       reserved: false,
            //       status: "inStock",
            //       _id: {
            //         $nin: packageAssetIdHasAssetNumberArray, // not include in packageAssetIdHasAssetNumberArray that have contain packageAssetId that has assetNumber
            //       },
            //     },
            //   },
            //   {
            //     $lookup: {
            //       from: "assets",
            //       let: { packageAssetId: "$_id" }, // define a variable to store the PackageAsset _id
            //       pipeline: [
            //         {
            //           $match: {
            //             $expr: {
            //               $eq: ["$packageAssetId", "$$packageAssetId"], // reference the correct field name here
            //             },
            //           },
            //         },
            //         {
            //           $project: {
            //             _id: 1,
            //           },
            //         },
            //       ],
            //       as: "asset",
            //     },
            //   },
            //   {
            //     $limit: +saveAssetWithdrawTableArrayObject[i].amount,
            //   },
            // ]);
            // console.log(packageAsset);
            // console.log(packageAsset.length);

            // loop packageAsset Array and update all child reserved:true
            for (let j = 0; j < packageAsset.length; j++) {
              let eachPackageAsset = packageAsset[j];
              let packageAssetId = eachPackageAsset._id;
              if (packageAssetId) {
                await BorrowHasPkAsset.create({
                  packageAssetId: packageAssetId,
                  borrowId: borrow.dataValues._id,
                });
              }
              // packageAssetIdArray.push({ packageAssetId });

              await PackageAsset.update(
                { reserved: true },

                {
                  where: {
                    _id: packageAssetId,
                  },
                }
              );
              console.log("packageAssetId", packageAssetId);
              // console.log(packageAsset[j].asset)
              if (eachPackageAsset.asset.length > 0) {
                for (let k = 0; k < eachPackageAsset.asset.length; k++) {
                  // console.log(assetId)
                  let assetId = eachPackageAsset.asset[k]._id;
                  console.log("assetId", assetId);
                  let a = await Asset.update(
                    { reserved: true },
                    {
                      where: {
                        _id: assetId,
                      },
                    }
                  );
                  console.log(a);
                  // console.log(asset)
                }
              }
            }

            // console.log(packageAsset.asset);
            // console.log(packageAssetId);
          } else {
            // isPackage === false
            console.log(44444);
            let asset = await Asset.findOne({
              where: {
                [Op.and]: [
                  {
                    productName:
                      saveAssetWithdrawTableArrayObject[i].productName,
                  },
                  { reserved: false },
                  { status: "inStock" },
                  {
                    _id: {
                      [Op.nin]: assetIdHasAssetNumberArray, // not include in assetIdHasAssetNumberArray that have contain packageAssetId that has assetNumber
                    },
                  },
                ],
              },
            });
            // console.log("asset", asset);

            for (let j = 0; j < asset.length; j++) {
              let eachAsset = asset[j];
              let assetId = eachAsset._id;

              await Asset.update(
                { reserved: true },

                {
                  where: {
                    _id: assetId,
                  },
                }
              );
              if (assetId) {
                await BorrowHasAsset.create({
                  borrowId: borrow.dataValues._id,
                  assetId: assetId,
                });
              }

              // assetIdArray.push({ assetId });
              // console.log("eachAsset",eachAsset)
            }
          }
        }
      }

      console.log("assetIdHasAssetNumberArray", assetIdHasAssetNumberArray);
      console.log(
        "packageAssetIdHasAssetNumberArray",
        packageAssetIdHasAssetNumberArray
      );
    }
    res.status(200).json({ borrow });
  } catch (err) {
    // console.error(`Error finding asset: ${err}`);
    next(err);
  }
};

exports.updateBorrow = async (req, res, next) => {
  try {
    const borrowId = req.params.borrowId;
    const { input, saveAssetWithdrawTableArray, deleteAssetArray } = req.body;

    // convert JSON to object
    const inputObject = JSON.parse(input);
    const saveAssetWithdrawTableArrayObject = JSON.parse(
      saveAssetWithdrawTableArray
    );
    console.log(
      "saveAssetWithdrawTableArrayObject",
      saveAssetWithdrawTableArrayObject
    );

    let {
      borrowIdDoc,
      pricePerDay,
      borrowDate,
      borrowSetReturnDate,
      sector,
      subSector,
      borrowPurpose,
      handler,
      building,
      floor,
      room,
      name_recorder,
      dateTime_recorder,
      name_courier,
      dateTime_courier,
      name_approver,
      dateTime_approver,
      status,
    } = inputObject;
    let deleteAssetArrayObject;

    // console.log("inputObject", inputObject);
    // console.log(
    //   "saveAssetWithdrawTableArrayObject",
    //   saveAssetWithdrawTableArrayObject
    // );

    // for store in borrow schema

    let updateAssetIdArray = [];
    let updatePackageAssetIdArray = [];

    // for query
    let assetIdHasAssetNumberArray = [];
    let packageAssetIdHasAssetNumberArray = [];
    let borrowById = await Borrow.findByPk(borrowId);
    if (borrowById.status == "saveDraft" && status == "saveDraft") {
      // borrowById.borrowIdDoc = borrowIdDoc;
      borrowById.pricePerDay = pricePerDay;
      borrowById.borrowDate = borrowDate;
      borrowById.borrowSetReturnDate = borrowSetReturnDate;
      borrowById.sector = sector;
      borrowById.subSector = subSector;
      borrowById.borrowPurpose = borrowPurpose;
      borrowById.handler = handler;
      borrowById.building = building;
      borrowById.floor = floor;
      borrowById.room = room;
      borrowById.name_recorder = name_recorder;
      borrowById.name_courier = name_recorder;
      await borrowById.save();
      await SubComponentBorrow.destroy({ where: { borrowId: borrowId } });
      for (let i = 0; i < saveAssetWithdrawTableArrayObject.length; i++) {
        await SubComponentBorrow.create({
          borrowId: borrowId,
          assetNumber: saveAssetWithdrawTableArrayObject[i].assetNumber,
          isPackage: saveAssetWithdrawTableArrayObject[i].isPackage,
          productName: saveAssetWithdrawTableArrayObject[i].productName,
          amount: saveAssetWithdrawTableArrayObject[i].amount,
        });
      }

      return res
        .status(200)
        .json({ message: "This borrow id updated successfully" });
    }
    if (borrowById.status != "saveDraft" && status != "saveDraft") {
      deleteAssetArrayObject = JSON.parse(deleteAssetArray);

      console.log(deleteAssetArrayObject);
    }
    for (let i = 0; i < saveAssetWithdrawTableArrayObject.length; i++) {
      if (saveAssetWithdrawTableArrayObject[i].isFetching === false) {
        // if have specific assetNumber
        if (saveAssetWithdrawTableArrayObject[i].assetNumber !== "") {
          if (saveAssetWithdrawTableArrayObject[i].isPackage) {
            // isPackage === true
            // console.log(1111);
            // console.log(saveAssetWithdrawTableArrayObject[i]);
            let packageAsset = await PackageAsset.findAll({
              where: {
                [Op.and]: [
                  {
                    assetNumber:
                      saveAssetWithdrawTableArrayObject[i].assetNumber,
                  },
                  {
                    reserved: false,
                  },
                  {
                    status: "inStock",
                  },
                ],
              },
              include: [{ model: Asset, as: "assets", attributes: ["_id"] }],
            });
            // console.log(111111111111);
            // console.log(packageAsset);
            packageAssetIdHasAssetNumberArray.push(packageAsset[0]._id);

            await PackageAsset.update(
              { reserved: true },
              {
                where: {
                  assetNumber: saveAssetWithdrawTableArrayObject[i].assetNumber,
                },
              }
            );

            const packageAssetId = packageAsset[0]._id;
            if (packageAssetId) {
              await BorrowHasPkAsset.create({
                packageAssetId: packageAssetId,
                borrowId: borrowId,
              });
            }
            // console.log(102,"packageAssetId",packageAssetId)
            // console.log("packageAsset.asset",packageAsset[0].asset)
            updatePackageAssetIdArray.push({ packageAssetId });

            if (packageAsset[0].asset.length > 0) {
              for (let k = 0; k < packageAsset[0].asset.length; k++) {
                // console.log(assetId)
                let assetId = packageAsset[0].asset[k]._id;
                console.log("assetId", assetId);
                let a = await Asset.update(
                  { reserved: true },
                  {
                    where: {
                      _id: assetId,
                    },
                  }
                );
                // console.log(a)
                // console.log(asset)
              }
            }

            // console.log("packageAssetId", packageAssetId);
          } else {
            // isPackage === false
            // console.log(22222);

            let asset = await Asset.findOne({
              where: {
                assetNumber: saveAssetWithdrawTableArrayObject[i].assetNumber,
              },
            });
            asset.reserved = true;
            await asset.save();

            assetIdHasAssetNumberArray.push(asset._id);
            // console.log("asset", asset);
            const assetId = asset._id;
            if (assetId) {
              console.log(12313123);

              await BorrowHasAsset.create({
                borrowId: borrowId,
                assetId: assetId,
              });
            }
            updateAssetIdArray.push({ assetId });
            // console.log("assetId", assetId);
          }
        } else {
          // else not have specific assetNumber
          if (saveAssetWithdrawTableArrayObject[i].isPackage) {
            // isPackage === true
            // console.log(3333333333333);
            // console.log(saveAssetWithdrawTableArrayObject[i]);
            let packageAsset = await PackageAsset.findAll({
              where: {
                [Op.and]: [
                  {
                    productName:
                      saveAssetWithdrawTableArrayObject[i].productName,
                  },
                  {
                    reserved: false,
                  },
                  {
                    status: "inStock",
                  },
                  {
                    [Op.nin]: packageAssetIdHasAssetNumberArray,
                  },
                ],
              },
              include: [{ model: Asset, as: "assets", attributes: ["_id"] }],
              limit: +saveAssetWithdrawTableArrayObject[i].amount,
            });

            // console.log(packageAsset);
            // console.log(packageAsset.length);

            // loop packageAsset Array and update all child reserved:true
            for (let j = 0; j < packageAsset.length; j++) {
              let eachPackageAsset = packageAsset[j];
              let packageAssetId = eachPackageAsset._id;
              updatePackageAssetIdArray.push({ packageAssetId });
              await PackageAsset.update(
                { reserved: true },
                {
                  where: {
                    _id: packageAssetId,
                  },
                }
              );

              console.log("packageAssetId", packageAssetId);
              if (!packageAssetId) {
                await BorrowHasPkAsset.create({
                  packageAssetId: packageAssetId,
                  borrowId: borrowId,
                });
              }
              // console.log(packageAsset[j].asset)
              if (eachPackageAsset.asset.length > 0) {
                for (let k = 0; k < eachPackageAsset.asset.length; k++) {
                  // console.log(assetId)
                  let assetId = eachPackageAsset.asset[k]._id;
                  console.log("assetId", assetId);
                  let a = await Asset.update(
                    { reserved: true },
                    {
                      where: {
                        _id: assetId,
                      },
                    }
                  );
                  console.log(a);
                  // console.log(asset)
                }
              }
            }

            // console.log(packageAsset.asset);
            // console.log(packageAssetId);
          } else {
            // isPackage === false
            console.log(44444);
            let asset = await Asset.findAll({
              where: {
                productName: saveAssetWithdrawTableArrayObject[i].productName,
                reserved: false,
                status: "inStock",
                _id: {
                  [Op.nin]: assetIdHasAssetNumberArray, // not include in assetIdHasAssetNumberArray that have contain packageAssetId that has assetNumber
                },
              },
              limit: +saveAssetWithdrawTableArrayObject[i].amount,
            });
            console.log("asset /n", asset);

            for (let j = 0; j < asset.length; j++) {
              let eachAsset = asset[j];
              let assetId = eachAsset._id;

              await Asset.update(
                { reserved: true },
                {
                  where: {
                    _id: assetId,
                  },
                }
              );
              if (!assetId) {
                await BorrowHasAsset.create({
                  assetId: assetId,
                  borrowId: borrowId,
                });
              }
              updateAssetIdArray.push({ assetId });
              // console.log("eachAsset",eachAsset)
            }
          }
        }
      }
    }

    borrowById = await Borrow.findByPk(borrowId);
    if (borrowById.status != "saveDraft") {
      // for delete assetId or packageAssetId
      for (let i = 0; i < deleteAssetArrayObject?.length; i++) {
        if (deleteAssetArrayObject[i].isPackage) {
          console.log("deleteAssetArrayObject[i]", deleteAssetArrayObject[i]);
          let packageAssetById = await PackageAsset.findAll({
            where: {
              [Op.and]: [
                {
                  assetNumber: deleteAssetArrayObject[i].assetNumber,
                },
                {
                  reserved: true,
                },
                {
                  status: "inStock",
                },
              ],
            },
            include: [{ model: Asset, as: "assets", attributes: ["_id"] }],
          });

          console.log(packageAssetById);
          console.log(packageAssetById[0].asset);
          let assetInPackageAssetArray = packageAssetById[0].asset;

          // let packageAssetById = await PackageAsset.find({
          //   assetNumber: deleteAssetArrayObject[i].assetNumber,
          // });
          let packageAssetId = packageAssetById[0]._id;
          let packageAssetAssetNumber = packageAssetById[0].assetNumber;
          console.log(packageAssetId);

          await PackageAsset.update(
            { reserved: false },
            {
              where: {
                _id: packageAssetId,
              },
            }
          );

          for (let j = 0; j < assetInPackageAssetArray.length; i++) {
            await Asset.update(
              { reserved: false },
              {
                where: {
                  _id: assetInPackageAssetArray[j]._id,
                },
              }
            );
          }
          await BorrowHasPkAsset.destroy({
            where: { packageAssetId: packageAssetId, borrowId: borrowId },
          });
          await SubComponentBorrow.destroy({
            where: {
              assetNumber: deleteAssetArrayObject[i].assetNumber,
              borrowId: borrowId,
            },
          });
        } else {
          let assetById = await Asset.findAll({
            where: {
              assetNumber: deleteAssetArrayObject[i].assetNumber,
            },
          });
          let assetId = assetById[0]._id;

          // console.log(assetId);

          await Asset.update(
            { reserved: false },
            {
              where: {
                _id: assetId,
              },
            }
          );
          await BorrowHasAsset.destroy({
            where: { assetId: assetId, borrowId: borrowId },
          });
          await SubComponentBorrow.destroy({
            where: {
              assetNumber: deleteAssetArrayObject[i].assetNumber,
              borrowId: borrowId,
            },
          });
        }
      }
    }
    console.log("updateAssetIdArray", updateAssetIdArray);
    borrowById = await Borrow.findByPk(borrowId);

    // borrowById.borrowIdDoc = borrowIdDoc;
    borrowById.pricePerDay = pricePerDay;
    borrowById.borrowDate = borrowDate;
    borrowById.borrowSetReturnDate = borrowSetReturnDate;
    borrowById.sector = sector;
    borrowById.subSector = subSector;
    borrowById.borrowPurpose = borrowPurpose;
    borrowById.handler = handler;
    borrowById.building = building;
    borrowById.floor = floor;
    borrowById.room = room;
    if (borrowById.status == "saveDraft" && status == "waiting") {
      borrowById.dateTime_recorder = new Date();
      // borrowById.assetIdArray = updateAssetIdArray;
      // borrowById.packageAssetIdArray = updatePackageAssetIdArray;
      // borrowById.assetWithDrawTableArray = [];
    }
    // else {
    // const oldAssetIdArray = borrowById.assetIdArray;
    // const newAssetIdArray = oldAssetIdArray.concat(updateAssetIdArray);
    // borrowById.assetIdArray = newAssetIdArray;
    // const oldPackageAssetIdArray = borrowById.packageAssetIdArray;
    // const newPackageAssetIdArray = oldPackageAssetIdArray.concat(
    //   updatePackageAssetIdArray
    // );
    // borrowById.packageAssetIdArray = newPackageAssetIdArray;
    // }
    borrowById.status = status ?? borrowById.status;
    await borrowById.save();

    // const borrow = Borrow.create({ ...data })
    res.status(200).json({ message: "This borrow id updated successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.deleteBorrow = async (req, res, next) => {
  try {
    const { borrowId } = req.params;
    const { reason } = req.body;
    const borrow = await Borrow.findByPk(borrowId);
    console.log(borrow);
    if (borrow.status == "saveDraft") {
      await Borrow.destroy({ where: { _id: borrowId } });
    } else {
      borrow.deletedAt = new Date();
      borrow.reason = reason;
      await borrow.save();
      const assetIdArray = await BorrowHasAsset.findAll({
        where: { borrowId: borrowId },
      });
      const packageAssetIdArray = await BorrowHasPkAsset.findAll({
        where: { borrowId: borrowId },
      });
      if (assetIdArray.length > 0) {
        for (let i = 0; i < assetIdArray.length; i++) {
          let assetId = assetIdArray[i].assetId;
          // console.log(assetId)
          await Asset.update(
            { reserved: false },

            { where: { _id: assetId } }
          );
          // console.log(asset)
        }
      }

      if (packageAssetIdArray.length > 0) {
        for (let i = 0; i < packageAssetIdArray.length; i++) {
          let packageAssetId = packageAssetIdArray[i].packageAssetId;
          // console.log(packageAssetId)
          let packageAsset = await PackageAsset.findAll({
            where: { _id: packageAssetId },
            include: [{ model: Asset, as: "assets", attributes: ["_id"] }],
          });
          // let packageAsset = await PackageAsset.aggregate([
          //   { $match: { _id: ObjectID(packageAssetId) } },
          //   {
          //     $lookup: {
          //       from: "assets",
          //       localField: "_id",
          //       foreignField: "packageAssetId",
          //       as: "asset",
          //     },
          //   },
          // ]);

          let findForUpdatePackageAsset = await PackageAsset.update(
            { reserved: false },

            {
              where: {
                _id: packageAssetId,
              },
            }
          );
          console.log("findForUpdatePackageAsset", findForUpdatePackageAsset);

          let assetInPackageArray = packageAsset[0].asset;
          // console.log("assetInPackageArray",i)
          // console.log(assetInPackageArray)
          if (assetInPackageArray.length > 0) {
            for (let j = 0; j < assetInPackageArray.length; j++) {
              // console.log(assetInPackageArray[j]._id)
              await Asset.update(
                {
                  _id: assetInPackageArray[j]._id,
                },
                { where: { reserved: false } }
              );
            }
          }

          // console.log(packageAsset)
        }
      }
    }
    res.status(200).json({ borrow });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getAllBorrow = async (req, res, next) => {
  try {
    const borrow = await Borrow.findAll({
      order: [["updatedAt", "DESC"]],
    });

    // for show how many pages
    // console.log(borrow);
    res.json({ borrow });
  } catch (err) {
    next(err);
  }
};

exports.getBySearch = async (req, res, next) => {
  try {
    // for one search but can find in 2 field(serialNumber,productName)
    // const search = req.query.search || "";

    // for 2 field search
    const typeTextSearch = req.query.typeTextSearch || "";
    const textSearch = req.query.textSearch || "";
    const status = req.query.status || "";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const sector = req.query.sector || "";
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    // console.log(req.query);
    // console.log(moment().endOf("day").toDate())

    // console.log(dateFrom);
    let modifiedDateFrom = "";
    if (dateFrom) {
      const dateFromObj = new Date(dateFrom);
      // dateFromObj.setFullYear(dateFromObj.getFullYear() - 543);
      // dateFromObj.setHours(dateFromObj.getHours() - 7);
      modifiedDateFrom = dateFromObj.toString();
      console.log(modifiedDateFrom);
    }

    let modifiedDateTo = "";
    if (dateTo) {
      const dateToObj = new Date(dateTo);
      // dateToObj.setFullYear(dateToObj.getFullYear() - 543);
      // dateToObj.setHours(dateToObj.getHours() - 7);
      modifiedDateTo = dateToObj.toString();
      // console.log(modifiedDateTo);
    }

    let queryArray = [];

    if (textSearch !== "") {
      queryArray.push({
        [typeTextSearch]: { [Op.like]: `%${textSearch}%` },
      });
    }

    if (status !== "") {
      queryArray.push({ status: status });
    } else {
      queryArray.push({
        status: {
          [Op.like]: `%${status}%`,
        },
      });
    }

    if (dateFrom !== "") {
      queryArray.push({
        createdAt: {
          [Op.gte]: new Date(modifiedDateFrom),
          [Op.lte]: moment().endOf("day").toDate(),
        },
      });
    }
    if (dateTo !== "") {
      queryArray.push({ createdAt: { [Op.lte]: new Date(modifiedDateTo) } });
    }
    if (dateFrom !== "" && dateTo !== "") {
      queryArray.push({
        createdAt: {
          [Op.gte]: new Date(modifiedDateFrom),
          [Op.lte]: new Date(modifiedDateTo),
        },
      });
    }
    if (sector !== "") {
      queryArray.push({ sector: sector });
    }
    queryArray.push({ deletedAt: { [Op.eq]: null } });
    console.log(queryArray, "queryArray");
    const borrow = await Borrow.findAll({
      where: { [Op.and]: queryArray },
      order: [["updatedAt", "DESC"]],
      offset: page * limit,
      limit: limit,
    });

    // console.log(asset)
    // for show how many pages
    const total = await Borrow.count({ where: { [Op.and]: queryArray } });

    res.json({ borrow, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getSectorForSearch = async (req, res, next) => {
  try {
    const sector = await Borrow.findAll({
      where: {
        [Op.and]: [
          { deletedAt: { [Op.eq]: null } },
          { sector: { [Op.ne]: null } },
          { sector: { [Op.ne]: "" } },
        ],
      },
      attributes: [
        ["sector", "sector"],
        [sequelize.fn("COUNT", sequelize.col("sector")), "numberOfzipcodes"],
      ],
      group: "sector",
      raw: true,
    });
    res.json({ sector });
  } catch (err) {
    next(err);
  }
};

exports.getSectorForSearchCheckReturnBorrow = async (req, res, next) => {
  try {
    const sector = await Borrow.findAll({
      where: {
        [Op.and]: [
          { deletedAt: { [Op.eq]: null } },
          { sector: { [Op.ne]: null } },
          { sector: { [Op.ne]: "" } },
          { sector: { [Op.in]: ["watingReturnApprove", "partiallyReturn"] } },
        ],
      },
      attributes: [
        ["sector", "sector"],
        [sequelize.fn("COUNT", sequelize.col("sector")), "numberOfzipcodes"],
      ],
      group: "sector",
      raw: true,
    });
    res.json({ sector });
  } catch (err) {
    next(err);
  }
};

exports.getBySearchTopBorrowApprove = async (req, res, next) => {
  try {
    // for one search but can find in 2 field(serialNumber,productName)
    // const search = req.query.search || "";

    // for 2 field search
    const listStatus =
      req.query.listStatus || "approve,reject,partiallyApprove";
    // const listStatus = ["approve","reject"]
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const sector = req.query.sector || "";
    // console.log(req.query);
    // console.log(moment().endOf("day").toDate())
    console.log("listStatus", listStatus);

    // if
    splitList = listStatus.split(",");
    console.log("splitList", splitList);

    // console.log(dateFrom);
    let modifiedDateFrom = "";
    if (dateFrom) {
      const dateFromObj = new Date(dateFrom);
      // dateFromObj.setFullYear(dateFromObj.getFullYear() + 543);
      // dateFromObj.setHours(dateFromObj.getHours() - 7);
      modifiedDateFrom = dateFromObj.toString();
      console.log(modifiedDateFrom);
    }

    let modifiedDateTo = "";
    if (dateTo) {
      const dateToObj = new Date(dateTo);
      // dateToObj.setFullYear(dateToObj.getFullYear() + 543);
      // dateToObj.setHours(dateToObj.getHours() - 7);
      modifiedDateTo = dateToObj.toString();
      // console.log(modifiedDateTo);
    }

    let queryArray = [];

    // if (status !== "") {
    //   if (status === "all") {
    //   } else {
    //     query["status"] = status;
    //   }
    // }

    if (dateFrom !== "") {
      queryArray.push({
        createdAt: {
          [Op.gte]: new Date(modifiedDateFrom),
          [Op.lte]: moment().endOf("day").toDate(),
        },
      });
    }
    if (dateTo !== "") {
      queryArray.push({ createdAt: { [Op.lte]: new Date(modifiedDateTo) } });
    }
    if (dateFrom !== "" && dateTo !== "") {
      queryArray.push({
        createdAt: {
          [Op.gte]: new Date(modifiedDateFrom),
          [Op.lte]: new Date(modifiedDateTo),
        },
      });
    }
    if (sector !== "") {
      queryArray.push({ sector: sector });
    }

    queryArray.push({ deletedAt: { [Op.eq]: null } });
    queryArray.push({ status: { [Op.eq]: "waiting" } });
    console.log(queryArray, "queryArray");

    const topApproveList = await Borrow.findAll({
      where: { [Op.and]: queryArray },
      order: [["updatedAt", "DESC"]],
    });
    queryArray.pop();
    queryArray.push({ status: { [Op.in]: splitList } });
    console.log("bottom", queryArray);
    const bottomApproveList = await Borrow.findAll({
      where: { [Op.and]: queryArray },
      order: [["updatedAt", "DESC"]],
    });
    // .sort({
    //   dateTime_approver: -1,
    // });

    // console.log(asset)
    // for show how many pages
    // const total = await Borrow.countDocuments(query);

    res.json({ topApproveList, bottomApproveList });
  } catch (err) {
    next(err);
  }
};

exports.getBorrowById = async (req, res, next) => {
  try {
    const borrowId = req.params.borrowId;
    const borrow = await Borrow.findOne({
      where: { _id: borrowId },
      include: [
        {
          model: BorrowHasAsset,
          as: "borrowHasAssets",
          require: false,
          include: [
            {
              model: Asset,
            },
          ],
        },
        {
          model: BorrowHasPkAsset,
          require: false,

          as: "borrowHasPkAssets",
        },
      ],
    });
    // const borrow = await Borrow.aggregate([
    //   { $match: { _id: ObjectID(borrowId) } },
    //   {
    //     $lookup: {
    //       from: "assets",
    //       let: { assetIds: "$assetIdArray.assetId" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 { $in: ["$_id", "$$assetIds"] },
    //                 { $not: { $gt: ["$deletedAt", null] } },
    //               ],
    //             },
    //           },
    //         },
    //       ],
    //       as: "assets",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "packageassets",
    //       let: { packageAssetIds: "$packageAssetIdArray.packageAssetId" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 { $in: ["$_id", "$$packageAssetIds"] },
    //                 { $not: { $gt: ["$deletedAt", null] } },
    //               ],
    //             },
    //           },
    //         },
    //       ],
    //       as: "packageAssets",
    //     },
    //   },
    // ]);

    res.json({ borrow: borrow });
  } catch (err) {
    next(err);
  }
};

// For BorrowApprove page
exports.getAllSectorFromBorrow = async (req, res, next) => {
  try {
    const sectors = await Borrow.distinct("sector");
    console.log(sectors);

    res.json({ sectors });
  } catch (err) {
    next(err);
  }
};

exports.getAllFirstFetchBorrowApprove = async (req, res, next) => {
  try {
    // for 2 field search
    const waitingList = await Borrow.find({
      status: "waiting",
      deletedAt: { $eq: null },
    });

    const bottomList = await Borrow.find({
      status: { $in: ["approve", "reject", "partiallyApprove"] },
      deletedAt: { $eq: null },
    });

    // for show how many borrow by status
    const totalWaiting = await Borrow.countDocuments({ status: "waiting" });
    const totalApprove = await Borrow.countDocuments({ status: "approve" });
    const totalReject = await Borrow.countDocuments({ status: "reject" });
    const totalAll = +totalWaiting + +totalApprove + +totalReject;

    // console.log(borrow);
    res.json({
      waitingList,
      bottomList,
      totalAll,
      totalWaiting,
      totalApprove,
      totalReject,
    });
  } catch (err) {
    next(err);
  }
};

exports.approveAllWaitingBorrow = async (req, res, next) => {
  try {
    const { topApproveList } = req.body;
    console.log(topApproveList);
    // convert JSON to object
    const topApproveListObject = JSON.parse(topApproveList);

    for (let i = 0; i < topApproveListObject.length; i++) {
      if (topApproveListObject[i].checked) {
        let borrowId = topApproveListObject[i]._id;
        let assetIdArray = topApproveListObject[i].assetIdArray;
        let packageAssetIdArray = topApproveListObject[i].packageAssetIdArray;

        await Borrow.update(
          { status: "approve", dateTime_approver: new Date() },

          { where: { _id: borrowId } }
        );
        for (let i = 0; i < assetIdArray; i++) {
          await BorrowHasAsset.update(
            {
              reason: assetIdArray[i].reason,
              return: assetIdArray[i].return,
            },
            { where: { assetId: assetIdArray[i].assetId, borrowId: borrowId } }
          );
        }
        for (let i = 0; i < packageAssetIdArray; i++) {
          await BorrowHasPkAsset.update(
            {
              reason: packageAssetIdArray[i].reason,
              return: packageAssetIdArray[i].return,
            },
            {
              where: {
                packageAssetId: packageAssetIdArray[i].packageAssetId,
                borrowId: borrowId,
              },
            }
          );
        }
        if (assetIdArray.length > 0) {
          for (let j = 0; j < assetIdArray.length; j++) {
            let assetId = assetIdArray[j].assetId;
            // console.log("assetId", assetId);
            let asset = await Asset.update(
              { status: "borrowed", reserved: false },
              { where: { _id: assetId } }
            );
          }
        }

        if (packageAssetIdArray.length > 0) {
          for (let k = 0; k < packageAssetIdArray.length; k++) {
            let packageAssetId = packageAssetIdArray[k].packageAssetId;
            // console.log("packageAssetId", packageAssetId);
            let packageAsset = await PackageAsset.update(
              { status: "borrowed", reserved: false },
              { where: { _id: packageAssetId } }
            );

            // console.log("/n/n");
            // console.log("packageAsset", packageAsset);
            let assetArray = await Asset.findOne({
              where: { packageAssetId: packageAssetId },
            });
            for (let l = 0; l < assetArray.length; l++) {
              let assetId = assetArray[l]._id;
              let asset = await Asset.update(
                { status: "borrowed", reserved: false },
                { where: { _id: assetId } }
              );
            }
            // console.log("asset",asset)
          }
        }
      }
    }

    res.json({ message: "All borrowings have been successfully approved." });
  } catch (err) {
    next(err);
  }
};

exports.rejectAllWaitingBorrow = async (req, res, next) => {
  try {
    const { topApproveList } = req.body;

    // convert JSON to object
    const topApproveListObject = JSON.parse(topApproveList);
    console.log(topApproveListObject);

    for (let i = 0; i < topApproveListObject.length; i++) {
      if (topApproveListObject[i].checked) {
        // console.log(topApproveListObject[i].checked,topApproveListObject[i])
        let borrowId = topApproveListObject[i]._id;
        let assetIdArray = topApproveListObject[i].assetIdArray;
        let packageAssetIdArray = topApproveListObject[i].packageAssetIdArray;

        await Borrow.update(
          {
            status: "reject",
            dateTime_approver: new Date(),
            reason: topApproveListObject[i].reason,
            // assetIdArray,
            // packageAssetIdArray,
          },
          { where: { _id: borrowId } }
        );
        for (let i = 0; i < assetIdArray; i++) {
          await BorrowHasAsset.update(
            {
              reason: assetIdArray[i].reason,
              return: assetIdArray[i].return,
            },
            { where: { assetId: assetIdArray[i].assetId, borrowId: borrowId } }
          );
        }
        for (let i = 0; i < packageAssetIdArray; i++) {
          await BorrowHasPkAsset.update(
            {
              reason: packageAssetIdArray[i].reason,
              return: packageAssetIdArray[i].return,
            },
            {
              where: {
                packageAssetId: packageAssetIdArray[i].packageAssetId,
                borrowId: borrowId,
              },
            }
          );
        }
        if (assetIdArray.length > 0) {
          for (let j = 0; j < assetIdArray.length; j++) {
            let assetId = assetIdArray[j].assetId;
            // console.log("assetId", assetId);
            let asset = await Asset.update(
              { status: "inStock", reserved: false },
              { where: { _id: assetId } }
            );
          }
        }

        if (packageAssetIdArray.length > 0) {
          for (let k = 0; k < packageAssetIdArray.length; k++) {
            let packageAssetId = packageAssetIdArray[k].packageAssetId;
            // console.log("packageAssetId", packageAssetId);
            let packageAsset = await PackageAsset.update(
              { status: "inStock", reserved: false },
              { where: { _id: packageAssetId } }
            );

            // console.log("/n/n");
            // console.log("packageAsset", packageAsset);
            let assetArray = await Asset.fineOne({
              where: { packageAssetId: packageAssetId },
            });
            for (let l = 0; l < assetArray.length; l++) {
              let assetId = assetArray[l]._id;
              let asset = await Asset.update(
                { status: "inStock", reserved: false },
                { where: { _id: assetId } }
              );
            }
            // console.log("asset",asset)
          }
        }
      }
    }

    res.json({ message: "All borrowings have been successfully rejected." });
  } catch (err) {
    next(err);
  }
};

exports.rejectIndividualWaitingBorrow = async (req, res, next) => {
  try {
    const { topApproveList } = req.body;

    // convert JSON to object
    const topApproveListObject = JSON.parse(topApproveList);
    console.log(topApproveListObject);

    let borrowId = topApproveListObject._id;
    let assetIdArray = topApproveListObject.assetIdArray;
    let packageAssetIdArray = topApproveListObject.packageAssetIdArray;

    // console.log("borrowId", borrowId);
    // console.log("assetIdArray", assetIdArray);
    // console.log("packageAssetIdArray", packageAssetIdArray);

    await Borrow.update(
      {
        status: "reject",
        dateTime_approver: new Date(),
        reason: topApproveListObject.reason,
        // assetIdArray,
        // packageAssetIdArray,
      },
      { where: { _id: borrowId } }
    );
    for (let i = 0; i < assetIdArray; i++) {
      await BorrowHasAsset.update(
        {
          reason: assetIdArray[i].reason,
          return: assetIdArray[i].return,
        },
        { where: { assetId: assetIdArray[i].assetId, borrowId: borrowId } }
      );
    }
    for (let i = 0; i < packageAssetIdArray; i++) {
      await BorrowHasPkAsset.update(
        {
          reason: packageAssetIdArray[i].reason,
          return: packageAssetIdArray[i].return,
        },
        {
          where: {
            packageAssetId: packageAssetIdArray[i].packageAssetId,
            borrowId: borrowId,
          },
        }
      );
    }

    if (assetIdArray.length > 0) {
      for (let j = 0; j < assetIdArray.length; j++) {
        let assetId = assetIdArray[j].assetId;
        // console.log("assetId", assetId);
        let asset = await Asset.update(
          { status: "inStock", reserved: false },

          { where: { _id: assetId } }
        );
      }
    }

    if (packageAssetIdArray.length > 0) {
      for (let k = 0; k < packageAssetIdArray.length; k++) {
        let packageAssetId = packageAssetIdArray[k].packageAssetId;
        // console.log("packageAssetId", packageAssetId);
        let packageAsset = await PackageAsset.update(
          { status: "inStock", reserved: false },

          { where: { _id: packageAssetId } }
        );

        let assetArray = await Asset.fineOne({
          where: { packageAssetId: packageAssetId },
        });
        for (let l = 0; l < assetArray.length; l++) {
          let assetId = assetArray[l]._id;
          let asset = await Asset.update(
            { status: "inStock", reserved: false },
            { where: { _id: assetId } }
          );
        }
      }
    }

    res.json({ message: "This borrowings has been successfully rejected." });
  } catch (err) {
    next(err);
  }
};

// borrowApproveDetail page
exports.partiallyApproveBorrowApproveDetail = async (req, res, next) => {
  try {
    const borrowId = req.params.borrowId;
    const { input } = req.body;

    // convert JSON to object
    const inputObject = JSON.parse(input);
    // console.log(inputObject);

    const assetIdArray = inputObject[0].assetIdArray;
    const packageAssetIdArray = inputObject[0].packageAssetIdArray;

    // console.log("borrowId", borrowId);
    // console.log("assetIdArray", assetIdArray);
    // console.log("packageAssetIdArray", packageAssetIdArray);

    // for check all reason have value
    const assetIdArrayReason = assetIdArray.every(
      (asset) => asset.reason !== "" && asset.reason !== null
    );
    const packageAssetIdArrayReason = packageAssetIdArray.every(
      (asset) => asset.reason !== "" && asset.reason !== null
    );
    const assetIdArrayUnReason = assetIdArray.every(
      (asset) => asset.reason == "" || asset.reason == null
    );
    const packageAssetIdArrayUnReason = packageAssetIdArray.every(
      (asset) => asset.reason == "" || asset.reason == null
    );
    if (assetIdArrayUnReason && packageAssetIdArrayUnReason) {
      // approve all
      await Borrow.update(
        {
          status: "approve",
          dateTime_approver: new Date(),
          note: inputObject.note,
          // assetIdArray,
          // packageAssetIdArray,
        },
        { where: { _id: borrowId } }
      );
      // for (let i = 0; i < assetIdArray; i++) {
      //   await BorrowHasAsset.update(
      //     {
      //       reason: assetIdArray[i].reason,
      //       return: assetIdArray[i].return,
      //     },
      //     { where: { assetId: assetIdArray[i].assetId, borrowId: borrowId } }
      //   );
      // }
      // for (let i = 0; i < packageAssetIdArray; i++) {
      //   await BorrowHasPkAsset.update(
      //     {
      //       reason: packageAssetIdArray[i].reason,
      //       return: packageAssetIdArray[i].return,
      //     },
      //     {
      //       where: {
      //         packageAssetId: packageAssetIdArray[i].packageAssetId,
      //         borrowId: borrowId,
      //       },
      //     }
      //   );
      // }
      for (el of assetIdArray) {
        // reject
        let assetId = el.assetId;
        await Asset.update(
          { status: "borrowed", reserved: false },
          { where: { _id: assetId } }
        );
      }

      // change all packageAsset status by id
      for (el of packageAssetIdArray) {
        let packageAssetId = el.packageAssetId;

        // reject
        await PackageAsset.update(
          { status: "borrowed", reserved: false },
          { where: { _id: packageAssetId } }
        );

        let assetArray = await Asset.findOne({
          where: { packageAssetId: packageAssetId },
        });
        for (let l = 0; l < assetArray.length; l++) {
          let assetId = assetArray[l]._id;
          await Asset.update(
            { status: "borrowed", reserved: false },
            { where: { _id: assetId } }
          );
        }
      }

      return res.json({
        message: "This borrowings has been successfully approved.",
      });
    }
    if (assetIdArrayReason && packageAssetIdArrayReason) {
      // reject all
      await Borrow.update(
        {
          status: "reject",
          dateTime_approver: new Date(),
          note: inputObject.note,
          // assetIdArray,
          // packageAssetIdArray,
        },
        { where: { _id: borrowId } }
      );
      for (let i = 0; i < assetIdArray; i++) {
        await BorrowHasAsset.update(
          {
            reason: assetIdArray[i].reason,
            return: assetIdArray[i].return,
          },
          { where: { assetId: assetIdArray[i].assetId, borrowId: borrowId } }
        );
      }
      for (let i = 0; i < packageAssetIdArray; i++) {
        await BorrowHasPkAsset.update(
          {
            reason: packageAssetIdArray[i].reason,
            return: packageAssetIdArray[i].return,
          },
          {
            where: {
              packageAssetId: packageAssetIdArray[i].packageAssetId,
              borrowId: borrowId,
            },
          }
        );
      }
      for (el of assetIdArray) {
        // reject
        let assetId = el.assetId;
        await Asset.update(
          { status: "inStock", reserved: false },
          { where: { _id: assetId } }
        );
      }

      // change all packageAsset status by id
      for (el of packageAssetIdArray) {
        let packageAssetId = el.packageAssetId;

        // reject
        await PackageAsset.update(
          { status: "inStock", reserved: false },
          { where: { _id: packageAssetId } }
        );

        let assetArray = await Asset.findOne({
          where: { packageAssetId: packageAssetId },
        });
        for (let l = 0; l < assetArray.length; l++) {
          let assetId = assetArray[l]._id;
          await Asset.update(
            { status: "inStock", reserved: false },
            { where: { _id: assetId } }
          );
        }
      }

      return res.json({
        message: "This borrowings has been successfully rejected.",
      });
    } else {
      // partially approve or approve

      // check obj in array ,what obj have some value in reason and return to array
      const assetIdReasonIndices = inputObject.assetIdArray
        .map((item, index) => {
          if (item.reason !== "") {
            return item;
          }
        })
        .filter((item) => item !== undefined);

      const packageAssetIdReasonIndices = inputObject.packageAssetIdArray
        .map((item, index) => {
          if (item.reason !== "") {
            return item;
          }
        })
        .filter((item) => item !== undefined);

      if (
        assetIdReasonIndices.length > 0 ||
        packageAssetIdReasonIndices.length > 0
      ) {
        // partially approve
        // console.log("assetIdReasonIndices",assetIdReasonIndices)
        // console.log("packageAssetIdReasonIndices",packageAssetIdReasonIndices)

        await Borrow.update(
          {
            status: "partiallyApprove",
            dateTime_approver: new Date(),
            note: inputObject.note,
            // assetIdArray,
            // packageAssetIdArray,
          },
          { where: { _id: borrowId } }
        );

        // change all asset status by id
        for (el of assetIdArray) {
          let assetId = el.assetId;
          let reason = el.reason;

          if (reason !== "") {
            // reject
            await Asset.update(
              { status: "inStock", reserved: false },
              { where: { _id: assetId } }
            );
          } else {
            // approve
            await Asset.update(
              { status: "borrowed", reserved: false },

              { where: { _id: assetId } }
            );
          }
        }

        // change all packageAsset status by id
        for (el of packageAssetIdArray) {
          let packageAssetId = el.packageAssetId;
          let reason = el.reason;

          if (reason !== "") {
            // reject
            await PackageAsset.update(
              { where: { _id: packageAssetId } },
              { status: "inStock", reserved: false },
              {
                returnOriginal: false,
              }
            );

            let assetArray = await Asset.findOne({
              where: { packageAssetId: packageAssetId },
            });
            for (let l = 0; l < assetArray.length; l++) {
              let assetId = assetArray[l]._id;
              await Asset.update(
                { status: "inStock", reserved: false },
                { where: { _id: assetId } }
              );
            }
          } else {
            // approve
            await PackageAsset.update(
              { status: "borrowed", reserved: false },
              { where: { _id: packageAssetId } }
            );

            let assetArray = await Asset.findOne({
              where: { packageAssetId: packageAssetId },
            });
            for (let l = 0; l < assetArray.length; l++) {
              let assetId = assetArray[l]._id;
              await Asset.update(
                { status: "inStock", reserved: false },
                { where: { _id: assetId } }
              );
            }
          }
        }

        res.json({
          message: "This borrowings has been successfully partially approved.",
        });
      } else {
        // approve all
        await Borrow.update(
          {
            status: "approve",
            dateTime_approver: new Date(),
            note: inputObject.note,
            // assetIdArray,
            // packageAssetIdArray,
          },
          { where: { _id: borrowId } }
        );

        for (el of assetIdArray) {
          // reject
          let assetId = el.assetId;
          await Asset.update(
            { status: "borrowed", reserved: false },
            { where: { _id: assetId } }
          );
        }

        // change all packageAsset status by id
        for (el of packageAssetIdArray) {
          let packageAssetId = el.packageAssetId;

          // reject
          await PackageAsset.update(
            { status: "borrowed", reserved: false },
            { where: { _id: packageAssetId } }
          );

          let assetArray = await Asset.fineOne({
            where: { packageAssetId: packageAssetId },
          });
          for (let l = 0; l < assetArray.length; l++) {
            let assetId = assetArray[l]._id;
            await Asset.update(
              { status: "borrowed", reserved: false },
              { where: { _id: assetId } }
            );
          }
        }

        res.json({
          message: "This borrowings has been successfully approved.",
        });
      }
    }
  } catch (err) {
    next(err);
  }
};

exports.rejectAllBorrowApproveDetail = async (req, res, next) => {
  try {
    const borrowId = req.params.borrowId;
    const { input } = req.body;

    // convert JSON to object
    const inputObject = JSON.parse(input);
    console.log(inputObject);

    const assetIdArray = inputObject.assetIdArray;
    const packageAssetIdArray = inputObject.packageAssetIdArray;

    // console.log("borrowId", borrowId);
    // console.log("assetIdArray", assetIdArray);
    // console.log("packageAssetIdArray", packageAssetIdArray);

    await Borrow.update(
      {
        status: "reject",
        dateTime_approver: new Date(),
        note: inputObject.note,
        reason: inputObject.reason,
        // assetIdArray,
        // packageAssetIdArray,
      },
      { where: { _id: borrowId } }
    );
    for (let i = 0; i < assetIdArray; i++) {
      await BorrowHasAsset.update(
        {
          reason: assetIdArray[i].reason,
          return: assetIdArray[i].return,
        },
        { where: { assetId: assetIdArray[i].assetId, borrowId: borrowId } }
      );
    }
    for (let i = 0; i < packageAssetIdArray; i++) {
      await BorrowHasPkAsset.update(
        {
          reason: packageAssetIdArray[i].reason,
          return: packageAssetIdArray[i].return,
        },
        {
          where: {
            packageAssetId: packageAssetIdArray[i].packageAssetId,
            borrowId: borrowId,
          },
        }
      );
    }
    if (assetIdArray.length > 0) {
      for (let j = 0; j < assetIdArray.length; j++) {
        let assetId = assetIdArray[j].assetId;
        // console.log("assetId", assetId);
        await Asset.update(
          { status: "inStock", reserved: false },
          { where: { _id: assetId } }
        );
      }
    }

    if (packageAssetIdArray.length > 0) {
      for (let k = 0; k < packageAssetIdArray.length; k++) {
        let packageAssetId = packageAssetIdArray[k].packageAssetId;
        // console.log("packageAssetId", packageAssetId);
        await PackageAsset.update(
          { status: "inStock", reserved: false },
          { where: { _id: packageAssetId } }
        );

        let assetArray = await Asset.findOne({
          where: { packageAssetId: packageAssetId },
        });
        for (let l = 0; l < assetArray.length; l++) {
          let assetId = assetArray[l]._id;
          await Asset.update(
            { status: "inStock", reserved: false },
            { where: { _id: assetId } }
          );
        }
      }
    }

    res.json({ message: "This borrowings has been successfully rejected." });
  } catch (err) {
    next(err);
  }
};

exports.getViewBorrowApproveDetailById = async (req, res, next) => {
  try {
    const borrowId = req.params.borrowId;

    const borrowArray = await Borrow.aggregate([
      { $match: { _id: ObjectID(borrowId) } },
      {
        $lookup: {
          from: "assets",
          let: { assetIds: "$assetIdArray.assetId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$assetIds"] },
                    { $not: { $gt: ["$deletedAt", null] } },
                  ],
                },
              },
            },
          ],
          as: "assets",
        },
      },
      {
        $lookup: {
          from: "packageassets",
          let: { packageAssetIds: "$packageAssetIdArray.packageAssetId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$packageAssetIds"] },
                    { $not: { $gt: ["$deletedAt", null] } },
                  ],
                },
              },
            },
          ],
          as: "packageAssets",
        },
      },
    ]);
    const borrow = borrowArray[0];

    const assetIdArray = borrow.assetIdArray;
    const packageAssetIdArray = borrow.packageAssetIdArray;

    const idArray = assetIdArray.concat(packageAssetIdArray);

    const assets = borrow.assets;
    const packageAssets = borrow.packageAssets;
    let totalAssetAndPackageArray = assets.concat(packageAssets);

    let rejectArray = [];
    let approveArray = [];

    for (let index = 0; index < idArray.length; index++) {
      if (idArray[index]?.reason !== "") {
        totalAssetAndPackageArray[index]["reason"] = idArray[index]?.reason;
        rejectArray.push(totalAssetAndPackageArray[index]);
      } else {
        approveArray.push(totalAssetAndPackageArray[index]);
      }
    }
    res.json({ borrow, approveArray, rejectArray });
  } catch (err) {
    next(err);
  }
};

exports.getBySearchBorrowHistory = async (req, res, next) => {
  try {
    // for one search but can find in 2 field(serialNumber,productName)
    // const search = req.query.search || "";

    // for 2 field search
    const typeTextSearch = req.query.typeTextSearch || "";
    const textSearch = req.query.textSearch || "";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const status = req.query.status || "";
    const sector = req.query.sector || "";
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;

    // console.log(req.query);
    // console.log(moment().endOf("day").toDate())

    // console.log(dateFrom);
    let modifiedDateFrom = "";
    if (dateFrom) {
      const dateFromObj = new Date(dateFrom);
      dateFromObj.setFullYear(dateFromObj.getFullYear());
      // dateFromObj.setHours(dateFromObj.getHours() - 7);
      modifiedDateFrom = dateFromObj.toString();
      console.log(modifiedDateFrom);
    }

    let modifiedDateTo = "";
    if (dateTo) {
      const dateToObj = new Date(dateTo);
      dateToObj.setFullYear(dateToObj.getFullYear());
      // dateToObj.setHours(dateToObj.getHours() - 7);
      modifiedDateTo = dateToObj.toString();
      // console.log(modifiedDateTo);
    }

    let queryArray = [];
    let idArray = [];

    if (textSearch !== "") {
      if (typeTextSearch === "assetNumber") {
        let assetArray = await Asset.findAll({
          where: {
            assetNumber: { [Op.like]: `%${textSearch}%` },
          },
        });
        console.log("assetArrayt", assetArray);
        let packageAssetArray = await PackageAsset.findAll({
          where: {
            assetNumber: { [Op.like]: `%${textSearch}%` },
          },
        });
        console.log("packageAssetArray", packageAssetArray);

        idArray = assetArray
          .concat(packageAssetArray)
          .map((asset) => asset._id);
        // if (idArray.length > 0) {
        // queryArray.push({
        //   [Op.or]: [
        //     {
        //       include: {
        //         model: BorrowHasAsset,
        //         as: "borrowHasAssets",
        //         where: { assetId: { [Op.in]: idArray } },
        //       },
        //     },
        //     {
        //       include: {
        //         model: BorrowHasPkAsset,

        //         where: { packageAssetId: { [Op.in]: idArray } },
        //       },
        //     },
        //   ],
        // });
        // query["$or"] = [
        //   { assetIdArray: { $elemMatch: { assetId: { $in: idArray } } } },
        //   {
        //     packageAssetIdArray: {
        //       $elemMatch: { packageAssetId: { $in: idArray } },
        //     },
        //   },
        // ];
        // }
        // console.log(idArray);
      } else {
        queryArray.push({
          [typeTextSearch]: { [Op.like]: `%${textSearch}%` },
        });
      }
    }

    if (dateFrom !== "") {
      queryArray.push({
        createdAt: {
          [Op.gte]: new Date(modifiedDateFrom),
          [Op.lte]: moment().endOf("day").toDate(),
        },
      });
    }
    if (dateTo !== "") {
      queryArray.push({ createdAt: { [Op.lte]: new Date(modifiedDateTo) } });
    }
    if (dateFrom !== "" && dateTo !== "") {
      queryArray.push({
        createdAt: {
          [Op.gte]: new Date(modifiedDateFrom),
          [Op.lte]: new Date(modifiedDateTo),
        },
      });
    }
    if (sector !== "") {
      queryArray.push({ sector: sector });
    }
    if (status !== "") {
      queryArray.push({ status: status });
    } else {
      queryArray.push({
        status: {
          [Op.in]: [
            "approve",
            "partiallyApprove",
            "waitingReturnApprove",
            "partiallyReturn",
            "done",
          ],
        },
      });
    }
    // queryArray.push({ status: "approve" });
    queryArray.push({ deletedAt: { [Op.eq]: null } });

    console.log(queryArray[0][Op.or], "queryArray");

    const borrow = await Borrow.findAll({
      where: {
        [Op.and]: queryArray,
        [Op.or]: [
          {
            "$borrowHasAssets.assetId$": {
              [Op.in]: idArray,
            },
          },
          {
            "$borrowHasPkAssets.packageAssetId$": {
              [Op.in]: idArray,
            },
          },
        ],
      },
      include: [
        {
          model: BorrowHasAsset,
          as: "borrowHasAssets",
          // require: false,
        },
        {
          model: borrowHasPkAsset,
          as: "borrowHasPkAssets",
          // require: false,
        },
      ],

      order: [["updatedAt", "DESC"]],
      offset: page * limit,
      limit: limit,
    });

    // console.log(asset)
    // for show how many pages
    const total = await Borrow.count({
      where: {
        [Op.and]: queryArray,
        [Op.or]: [
          {
            "$borrowHasAssets.assetId$": {
              [Op.in]: idArray,
            },
          },
          {
            "$borrowHasPkAssets.packageAssetId$": {
              [Op.in]: idArray,
            },
          },
        ],
      },
      include: [
        {
          model: BorrowHasAsset,
          as: "borrowHasAssets",
          // require: false,
        },
        {
          model: borrowHasPkAsset,
          as: "borrowHasPkAssets",
        },
      ],
    });

    res.json({ borrow, idArray, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getBorrowHistorySector = async (req, res, next) => {
  try {
    const sectors = await Borrow.findAll({
      where: {
        [Op.and]: [
          { sector: { [Op.ne]: null } },
          { sector: { [Op.ne]: "" } },
          {
            status: {
              [Op.in]: [
                "approve",
                "partiallyApprove",
                "waitingReturnApprove",
                "partiallyReturn",
                "done",
              ],
            },
          },
        ],
      },
      attributes: [
        // ["_id", "_id"],
        ["sector", "sector"],
        [sequelize.fn("COUNT", sequelize.col("sector")), "numberOfzipcodes"],
      ],
      group: "sector",
      raw: true,
    });

    res.json({ sectors });
  } catch (err) {
    next(err);
  }
};

//  borrowCheck page
exports.getBySearchBorrowCheck = async (req, res, next) => {
  try {
    // for one search but can find in 2 field(serialNumber,productName)
    // const search = req.query.search || "";

    // for 2 field search
    const typeTextSearch = req.query.typeTextSearch || "";
    const textSearch = req.query.textSearch || "";
    const dateFrom = req.query.dateFrom || "";
    const dateTo = req.query.dateTo || "";
    const status = req.query.status || "";
    const sector = req.query.sector || "";
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;

    // console.log(req.query);
    // console.log(moment().endOf("day").toDate())

    // console.log(dateFrom);
    let modifiedDateFrom = "";
    if (dateFrom) {
      const dateFromObj = new Date(dateFrom);
      // dateFromObj.setFullYear(dateFromObj.getFullYear() - 543);
      // dateFromObj.setHours(dateFromObj.getHours() - 7);
      modifiedDateFrom = dateFromObj.toString();
      console.log(modifiedDateFrom);
    }

    let modifiedDateTo = "";
    if (dateTo) {
      const dateToObj = new Date(dateTo);
      // dateToObj.setFullYear(dateToObj.getFullYear() - 543);
      // dateToObj.setHours(dateToObj.getHours() - 7);
      modifiedDateTo = dateToObj.toString();
      // console.log(modifiedDateTo);
    }

    let queryArray = [];

    let idArray = [];

    if (textSearch !== "") {
      if (typeTextSearch === "assetNumber") {
        let assetArray = await Asset.findAll({
          where: {
            assetNumber: { [Op.like]: `%${textSearch}%` },
          },
        });
        console.log("assetArray", assetArray);
        let packageAssetArray = await PackageAsset.findAll({
          where: {
            assetNumber: { [Op.like]: `%${textSearch}%` },
          },
        });
        console.log("packageAssetArray", packageAssetArray);

        idArray = assetArray
          .concat(packageAssetArray)
          .map((asset) => asset._id);
        console.log("idArray : ", idArray);
        if (idArray.length > 0) {
          // queryArray.push({
          //   [Op.or]: [
          //     {
          //       include: {
          //         model: BorrowHasAsset,
          //         // as: "borrowHasAssets",
          //         where: { assetId: { [Op.in]: idArray } },
          //       },
          //     },
          //     {
          //       include: {
          //         model: BorrowHasPkAsset,
          //         where: { packageAssetId: { [Op.in]: idArray } },
          //       },
          //     },
          //   ],
          // });
          // query["$or"] = [
          //   { assetIdArray: { $elemMatch: { assetId: { $in: idArray } } } },
          //   {
          //     packageAssetIdArray: {
          //       $elemMatch: { packageAssetId: { $in: idArray } },
          //     },
          //   },
          // ];
        }
        console.log(idArray);
      } else {
        queryArray.push({
          [typeTextSearch]: { [Op.like]: `%${textSearch}%` },
        });
      }
    }

    if (dateFrom !== "") {
      queryArray.push({
        createdAt: {
          [Op.gte]: new Date(modifiedDateFrom),
          [Op.lte]: moment().endOf("day").toDate(),
        },
      });
    }
    if (dateTo !== "") {
      queryArray.push({ createdAt: { [Op.lte]: new Date(modifiedDateTo) } });
    }
    if (dateFrom !== "" && dateTo !== "") {
      queryArray.push({
        createdAt: {
          [Op.gte]: new Date(modifiedDateFrom),
          [Op.lte]: new Date(modifiedDateTo),
        },
      });
    }
    // if (sector !== "") {
    //   query["sector"] = sector;
    // }
    // if (status !== "") {
    //   query["status"] = status;
    // } else {
    //   query["status"] = {
    //     $in: ["approve", "partiallyApprove", "done"],
    //   };
    // }

    if (sector !== "") {
      queryArray.push({ sector: sector });
    }
    if (status !== "") {
      queryArray.push({ status: status });
    } else {
      queryArray.push({
        status: {
          [Op.in]: ["approve", "partiallyApprove", "done"],
        },
      });
    }
    queryArray.push({ status: "approve" });
    queryArray.push({ deletedAt: { [Op.eq]: null } });

    console.log(queryArray, "queryArray");

    const borrow = await Borrow.findAll({
      where: {
        [Op.and]: queryArray,
        [Op.or]: [
          {
            "$borrowHasAssets.assetId$": {
              [Op.in]: idArray,
            },
          },
          {
            "$borrowHasPkAssets.packageAssetId$": {
              [Op.in]: idArray,
            },
          },
        ],
      },
      include: [
        {
          model: BorrowHasAsset,
          as: "borrowHasAssets",
          // require: true,
        },
        {
          model: borrowHasPkAsset,
          as: "borrowHasPkAssets",
          // require: true,
        },
      ],

      order: [["updatedAt", "DESC"]],
      offset: page * limit,
      // limit: limit,
    });

    // console.log(asset)
    // for show how many pages
    const total = await Borrow.count({
      where: {
        [Op.and]: queryArray,
        [Op.or]: [
          {
            "$borrowHasAssets.assetId$": {
              [Op.in]: idArray,
            },
          },
          {
            "$borrowHasPkAssets.packageAssetId$": {
              [Op.in]: idArray,
            },
          },
        ],
      },
      include: [
        {
          model: BorrowHasAsset,
          as: "borrowHasAssets",
          // require: false,
        },
        {
          model: borrowHasPkAsset,
          as: "borrowHasPkAssets",
        },
      ],
    });

    res.json({ borrow, idArray, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getBorrowCheckSector = async (req, res, next) => {
  try {
    const sector = await Borrow.findAll({
      where: {
        [Op.and]: [
          { deletedAt: { [Op.eq]: null } },
          { sector: { [Op.ne]: null } },
          { sector: { [Op.ne]: "" } },
          {
            sector: {
              [Op.in]: [
                "watingReturnApprove",
                "partiallyReturn",
                "approveReturn",
              ],
            },
          },
        ],
      },
      attributes: [
        ["sector", "sector"],
        [sequelize.fn("COUNT", sequelize.col("sector")), "numberOfzipcodes"],
      ],
      group: "sector",
      raw: true,
    });
    res.json({ sector });
    // const sectors = await Borrow.aggregate([
    //   {
    //     $match: {
    //       sector: { $ne: null },
    //       status: {
    //         $in: [
    //           // "approve",
    //           // "partiallyApprove",
    //           "waitingReturnApprove",
    //           "partiallyReturn",
    //           "approveReturn",
    //         ],
    //       },
    //       deletedAt: { $eq: null },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$sector",
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       sector: "$_id",
    //     },
    //   },
    // ]);
  } catch (err) {
    next(err);
  }
};

exports.getBorrowCheckById = async (req, res, next) => {
  try {
    const borrowId = req.params.borrowId;

    let borrow = await Borrow.aggregate([
      { $match: { _id: ObjectID(borrowId) } },
      {
        $addFields: {
          assetIdArray: {
            $filter: {
              input: "$assetIdArray",
              cond: { $eq: ["$$this.reason", ""] },
            },
          },
          packageAssetIdArray: {
            $filter: {
              input: "$packageAssetIdArray",
              cond: { $eq: ["$$this.reason", ""] },
            },
          },
        },
      },
      {
        $lookup: {
          from: "assets",
          localField: "assetIdArray.assetId",
          foreignField: "_id",
          as: "matchedAssets",
        },
      },
      {
        $lookup: {
          from: "packageassets",
          localField: "packageAssetIdArray.packageAssetId",
          foreignField: "_id",
          as: "matchedPackageAssets",
        },
      },
    ]);

    borrow = borrow[0];
    // console.log(borrow);

    let assetIdArray = borrow.assetIdArray;
    // console.log(assetIdArray);
    let packageAssetIdArray = borrow.packageAssetIdArray;
    // console.log(packageAssetIdArray);
    let matchedAssets = borrow.matchedAssets;
    // console.log(matchedAssets);
    let matchedPackageAssets = borrow.matchedPackageAssets;

    for (let i = 0; i < matchedAssets.length; i++) {
      if (
        assetIdArray[i]?.returnDate !== undefined ||
        assetIdArray[i]?.returnDate !== "" ||
        assetIdArray[i]?.return !== undefined ||
        assetIdArray[i]?.return !== ""
      ) {
        matchedAssets[i].returnDate = assetIdArray[i]?.returnDate;
        matchedAssets[i].return = assetIdArray[i]?.return;
      }
    }
    for (let i = 0; i < matchedPackageAssets.length; i++) {
      if (
        packageAssetIdArray[i]?.returnDate !== undefined ||
        packageAssetIdArray[i]?.returnDate !== "" ||
        packageAssetIdArray[i]?.return !== undefined ||
        packageAssetIdArray[i]?.return !== ""
      ) {
        matchedPackageAssets[i].returnDate = packageAssetIdArray[i]?.returnDate;
        matchedPackageAssets[i].return = packageAssetIdArray[i]?.return;
      }
    }

    borrow = { ...borrow, matchedAssets, matchedPackageAssets };
    // console.log(borrow);

    res.json({ borrow });
    // res.json({ borrow :borrow[0]});
  } catch (err) {
    next(err);
  }
};

exports.updateBorrowCheckSavingById = async (req, res, next) => {
  try {
    const borrowId = req.params.borrowId;
    const { input, existArrayImage } = req.body;
    // console.log(borrowId)

    // convert JSON to object
    const inputObject = JSON.parse(input);
    // console.log(inputObject);
    const existArrayImageArray = JSON.parse(existArrayImage);

    const assetIdArray = inputObject.assetIdArray;
    const packageAssetIdArray = inputObject.packageAssetIdArray;

    const arrayImage = req?.files?.arrayImage || [];
    // const arrayImage = req?.files?.arrayImage || [];

    // console.log(arrayImage);

    // let saveImageArray = [];
    // for (let i = 0; i < arrayImage.length; i++) {
    //   saveImageArray.push({ image: arrayImage[i].filename });
    // }

    // console.log("borrowId", borrowId);
    console.log("assetIdArray", assetIdArray);
    console.log("packageAssetIdArray", packageAssetIdArray);

    // for check all checked is true
    // const assetIdArrayReturn = assetIdArray.every(
    //   (asset) => asset.return === "watingApprove"
    // );
    // const packageAssetIdArrayReturn = packageAssetIdArray.every(
    //   (asset) => asset.return === "watingApprove"
    // );
    const borrowById = await Borrow.findByPk(borrowId);

    const oldImageArray = borrowById.imageArray;

    if (arrayImage.length > 0) {
      for (el of arrayImage) {
        await BorrowImage.create({
          image: el.filename,
          borrowId: borrowId,
        });
      }
    }

    let notExistArrayImage = [];

    function getNotExistImage(existArray, oldImageArray, notExistArray) {
      const existObjects = existArray.map((obj) => obj.image + obj._id);

      for (let i = 0; i < oldImageArray.length; i++) {
        if (
          !existObjects.includes(oldImageArray[i].image + oldImageArray[i]._id)
        ) {
          notExistArray.push(oldImageArray[i]);
        }
      }

      return notExistArray;
    }
    notExistArrayImage = getNotExistImage(
      existArrayImageArray,
      oldImageArray,
      notExistArrayImage
    );
    if (notExistArrayImage.length > 0) {
      console.log("notExistArrayImage", notExistArrayImage);
      for (let i = 0; i < notExistArrayImage.length; i++) {
        await BorrowImage.destroy({
          where: { _id: notExistArrayImage[i]._id },
        });
        delete_file(`./public/pics/${notExistArrayImage[i].image}`);
      }
    }

    // return all for approve
    await Borrow.update(
      {
        status: "waitingReturnApprove",
        // assetIdArray,
        // packageAssetIdArray,
      },
      { where: { _id: borrowId } }
    );
    for (let i = 0; i < assetIdArray.length; i++) {
      const updateBorrowHasAsset = await BorrowHasAsset.update(
        {
          reason: assetIdArray[i].reason,
          return: assetIdArray[i].return,
          returnDate: assetIdArray[i].returnDate,
        },
        { where: { assetId: assetIdArray[i].assetId, borrowId: borrowId } }
      );
    }
    for (let i = 0; i < packageAssetIdArray.length; i++) {
      const updateBorrowHasPackageAsset = await BorrowHasPkAsset.update(
        {
          reason: packageAssetIdArray[i].reason,
          return: packageAssetIdArray[i].return,
          returnDate: packageAssetIdArray[i].returnDate,
        },
        {
          where: {
            assetId: packageAssetIdArray[i].packageAssetId,
            borrowId: borrowId,
          },
        }
      );
    }

    res.json({
      message:
        "This borrowings has been successfully requested for approval return.",
    });
  } catch (err) {
    next(err);
  }
};

exports.updateBorrowCheckReturnApproveById = async (req, res, next) => {
  try {
    const borrowId = req.params.borrowId;
    const { input, existArrayImage } = req.body;
    // console.log(borrowId)

    // convert JSON to object
    const inputObject = JSON.parse(input);
    // console.log(inputObject);

    const assetIdArray = inputObject.assetIdArray;
    const packageAssetIdArray = inputObject.packageAssetIdArray;

    // console.log("existArrayImage", existArrayImage);
    // console.log("arrayImage", arrayImage);

    // let saveImageArray = [];
    // for (let i = 0; i < arrayImage.length; i++) {
    //   saveImageArray.push({ image: arrayImage[i].filename });
    // }

    // console.log("borrowId", borrowId);

    // console.log("assetIdArray", assetIdArray);
    // console.log("packageAssetIdArray", packageAssetIdArray);

    //
    const borrowById = await Borrow.findByPk(borrowId);

    // for check all checked is true
    const assetIdArrayReturn = assetIdArray.every(
      (asset) => asset.return === "done"
    );
    const packageAssetIdArrayReturn = packageAssetIdArray.every(
      (asset) => asset.return === "done"
    );

    // console.log("assetIdArrayReturn", assetIdArrayReturn);
    // console.log("packageAssetIdArrayReturn", packageAssetIdArrayReturn);

    if (assetIdArrayReturn && packageAssetIdArrayReturn) {
      // console.log(111111);

      const assetDates = inputObject.assetIdArray.map(
        (asset) => new Date(asset.returnDate)
      );
      const packageDates = inputObject.packageAssetIdArray.map(
        (packageAsset) => new Date(packageAsset.returnDate)
      );
      const allDates = assetDates.concat(packageDates);
      const maxDate = new Date(Math.max.apply(null, allDates));

      // console.log(maxDate);

      // return all
      await Borrow.update(
        {
          status: "done",
          borrowReturnDate: new Date(maxDate),
          // assetIdArray,
          // packageAssetIdArray,
        },
        { where: { _id: borrowId } }
      );
      // update borrow has asset
      for (let i = 0; i < assetIdArray.length; i++) {
        const updateBorrowHasAsset = await BorrowHasAsset.update(
          {
            reason: assetIdArray[i].reason,
            return: assetIdArray[i].return,
            returnDate: assetIdArray[i].returnDate,
          },
          { where: { assetId: assetIdArray[i].assetId, borrowId: borrowId } }
        );
      }
      // update borrow has pkAsset
      for (let i = 0; i < packageAssetIdArray.length; i++) {
        const updateBorrowHasPackageAsset = await BorrowHasPkAsset.update(
          {
            reason: packageAssetIdArray[i].reason,
            return: packageAssetIdArray[i].return,
            returnDate: packageAssetIdArray[i].returnDate,
          },
          {
            where: {
              assetId: packageAssetIdArray[i].packageAssetId,
              borrowId: borrowId,
            },
          }
        );
      }

      for (let i = 0; i < assetIdArray.length; i++) {
        if (assetIdArray[i].return === "done") {
          await Asset.update(
            {
              status: "inStock",
            },
            { where: { _id: assetIdArray[i].assetId } }
          );
        }
      }
      for (let i = 0; i < packageAssetIdArray.length; i++) {
        if (packageAssetIdArray[i].return === "done") {
          await PackageAsset.update(
            {
              status: "inStock",
            },
            { where: { _id: packageAssetIdArray[i].packageAssetId } }
          );
        }
      }
    } else {
      //   console.log(22222222);
      // for check some return === "done"
      const assetIdArraySomeReturn = assetIdArray.some(
        (asset) => asset.return === "done"
      );
      const packageAssetIdArraySomeReturn = packageAssetIdArray.some(
        (asset) => asset.return === "done"
      );
      // console.log("assetIdArraySomeReturn",assetIdArraySomeReturn)
      // console.log("packageAssetIdArraySomeReturn",packageAssetIdArraySomeReturn)
      // partially return
      await Borrow.update(
        {
          status: "partiallyReturn",
          // assetIdArray,
          // packageAssetIdArray,
        },
        { where: { _id: borrowId } }
      );
      // update borrow has asset
      for (let i = 0; i < assetIdArray.length; i++) {
        const updateBorrowHasAsset = await BorrowHasAsset.update(
          {
            reason: assetIdArray[i].reason,
            return: assetIdArray[i].return,
            returnDate: assetIdArray[i].returnDate,
          },
          { where: { assetId: assetIdArray[i].assetId, borrowId: borrowId } }
        );
      }
      // update borrow has pkAsset
      for (let i = 0; i < packageAssetIdArray.length; i++) {
        const updateBorrowHasPackageAsset = await BorrowHasPkAsset.update(
          {
            reason: packageAssetIdArray[i].reason,
            return: packageAssetIdArray[i].return,
            returnDate: packageAssetIdArray[i].returnDate,
          },
          {
            where: {
              packageAssetId: packageAssetIdArray[i].packageAssetId,
              borrowId: borrowId,
            },
          }
        );
      }
      if (assetIdArraySomeReturn) {
        for (let i = 0; i < assetIdArray.length; i++) {
          if (assetIdArray[i].return === "done") {
            await Asset.update(
              {
                status: "inStock",
              },
              { where: { _id: assetIdArray[i].assetId } }
            );
          }
        }
      }
      if (packageAssetIdArraySomeReturn) {
        for (let i = 0; i < packageAssetIdArray.length; i++) {
          if (packageAssetIdArray[i].return === "done") {
            await PackageAsset.update(
              {
                status: "inStock",
              },
              { where: { _id: packageAssetIdArray[i].packageAssetId } }
            );
          }
        }
      }
    }

    res.json({
      message:
        "This borrowings has been successfully requested for approval return.",
    });
  } catch (err) {
    next(err);
  }
};

exports.getViewBorrowHistoryByAssetId = async (req, res, next) => {
  try {
    const assetId = req.params.assetId;
    const borrows = await Borrow.findAll({
      // where: {
      //   include: {
      //     model: BorrowHasAsset,
      //     where: { assetId: assetId },
      //   },
      // },
      include: {
        model: BorrowHasAsset,
        as: "borrowHasAssets",
        where: { assetId: assetId },
      },
      attributes: [
        "_id",
        "borrowIdDoc",
        "handler",
        "sector",
        "borrowDate",
        "borrowSetReturnDate",
        "borrowReturnDate",
        "status",
      ],
    });

    res.json({ borrows });
  } catch (err) {
    next(err);
  }
};

exports.getViewBorrowHistoryByPackageAssetId = async (req, res, next) => {
  try {
    const packageAssetId = req.params.packageAssetId;
    const borrows = await Borrow.findOne({
      include: {
        model: BorrowHasPkAsset,
        as: "borrowHasAssets",
        where: { packageAssetId: packageAssetId },
      },
      attributes: [
        "_id",
        "borrowIdDoc",
        "handler",
        "sector",
        "borrowDate",
        "borrowSetReturnDate",
        "borrowReturnDate",
        "status",
      ],
    });

    res.json({ borrows });
  } catch (err) {
    next(err);
  }
};
