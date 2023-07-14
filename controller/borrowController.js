const Borrow = require("../models").borrow;
const SubComponentBorrow = require("../models").subComponentBorrow;

const Asset = require("../models").asset;
const PackageAsset = require("../models").packageAsset;
const { Op } = require("sequelize");
const sequelize = require("sequelize");
const moment = require("moment/moment");

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
    let assetIdArray = [];
    let packageAssetIdArray = [];

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
        // dateTime_recorder: new Date(),
        name_courier: name_recorder,
        dateTime_courier: new Date(),
        name_approver: name_approver,
        dateTime_approver: dateTime_approver,
        status: status,
        // assetWithDrawTableArray: saveAssetWithdrawTableArrayObject,
      });
      for (let i = 0; i < saveAssetWithdrawTableArrayObject.length; i++) {
        await SubComponentBorrow.create({
          borrowId: borrow._id,
          assetNumber: saveAssetWithdrawTableArrayObject[i].assetNumber,
          isPackage: saveAssetWithdrawTableArrayObject[i].isPackage,
          productName: saveAssetWithdrawTableArrayObject[i].productName,
          amount: saveAssetWithdrawTableArrayObject[i].amount,
        });
      }
    } else {
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
                assetNumber: saveAssetWithdrawTableArrayObject[i].assetNumber,
              }
            );

            const packageAssetId = packageAsset[0]._id;
            // console.log(102,"packageAssetId",packageAssetId)
            // console.log("packageAsset.asset",packageAsset[0].asset)
            packageAssetIdArray.push({ packageAssetId });

            if (packageAsset[0].asset.length > 0) {
              for (let k = 0; k < packageAsset[0].asset.length; k++) {
                // console.log(assetId)
                let assetId = packageAsset[0].asset[k]._id;
                console.log("assetId", assetId);
                let a = await Asset.findOneAndUpdate(
                  {
                    _id: assetId,
                  },
                  { reserved: true },
                  {
                    returnOriginal: false,
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
            const asset = await Asset.findOneAndUpdate(
              {
                assetNumber: saveAssetWithdrawTableArrayObject[i].assetNumber,
              },
              { reserved: true },
              {
                returnOriginal: false,
              }
            );
            assetIdHasAssetNumberArray.push(asset._id);
            // console.log("asset", asset);
            const assetId = asset._id;
            assetIdArray.push({ assetId });
            // console.log("assetId", assetId);
          }
        } else {
          // else not have specific assetNumber
          if (saveAssetWithdrawTableArrayObject[i].isPackage) {
            // isPackage === true
            // console.log(3333333333333);
            // console.log(saveAssetWithdrawTableArrayObject[i]);

            let packageAsset = await PackageAsset.aggregate([
              {
                $match: {
                  productName: saveAssetWithdrawTableArrayObject[i].productName,
                  reserved: false,
                  status: "inStock",
                  _id: {
                    $nin: packageAssetIdHasAssetNumberArray, // not include in packageAssetIdHasAssetNumberArray that have contain packageAssetId that has assetNumber
                  },
                },
              },
              {
                $lookup: {
                  from: "assets",
                  let: { packageAssetId: "$_id" }, // define a variable to store the PackageAsset _id
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$packageAssetId", "$$packageAssetId"], // reference the correct field name here
                        },
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                      },
                    },
                  ],
                  as: "asset",
                },
              },
              {
                $limit: +saveAssetWithdrawTableArrayObject[i].amount,
              },
            ]);
            // console.log(packageAsset);
            // console.log(packageAsset.length);

            // loop packageAsset Array and update all child reserved:true
            for (let j = 0; j < packageAsset.length; j++) {
              let eachPackageAsset = packageAsset[j];
              let packageAssetId = eachPackageAsset._id;
              packageAssetIdArray.push({ packageAssetId });

              await PackageAsset.findOneAndUpdate(
                {
                  _id: packageAssetId,
                },
                { reserved: true },
                {
                  returnOriginal: false,
                }
              );
              console.log("packageAssetId", packageAssetId);
              // console.log(packageAsset[j].asset)
              if (eachPackageAsset.asset.length > 0) {
                for (let k = 0; k < eachPackageAsset.asset.length; k++) {
                  // console.log(assetId)
                  let assetId = eachPackageAsset.asset[k]._id;
                  console.log("assetId", assetId);
                  let a = await Asset.findOneAndUpdate(
                    {
                      _id: assetId,
                    },
                    { reserved: true },
                    {
                      returnOriginal: false,
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
            let asset = await Asset.find({
              productName: saveAssetWithdrawTableArrayObject[i].productName,
              reserved: false,
              status: "inStock",
              _id: {
                $nin: assetIdHasAssetNumberArray, // not include in assetIdHasAssetNumberArray that have contain packageAssetId that has assetNumber
              },
            });
            // console.log("asset", asset);

            for (let j = 0; j < asset.length; j++) {
              let eachAsset = asset[j];
              let assetId = eachAsset._id;

              await Asset.findOneAndUpdate(
                {
                  _id: assetId,
                },
                { reserved: true },
                {
                  returnOriginal: false,
                }
              );

              assetIdArray.push({ assetId });
              // console.log("eachAsset",eachAsset)
            }
          }
        }
      }
      console.log("assetIdArray", assetIdArray);
      console.log("packageAssetIdArray", packageAssetIdArray);

      //
      console.log("assetIdHasAssetNumberArray", assetIdHasAssetNumberArray);
      console.log(
        "packageAssetIdHasAssetNumberArray",
        packageAssetIdHasAssetNumberArray
      );
      if (status != "saveDraft") {
        status = "waiting";
      }
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
        status: status,
        assetIdArray,
        packageAssetIdArray,
      });
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
    let borrowById = await Borrow.findById(borrowId);
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
      borrowById.status = status ?? borrowById.status;
      borrowById.assetWithDrawTableArray = saveAssetWithdrawTableArrayObject;
      await borrowById.save();

      // const borrow = Borrow.create({ ...data })
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
            let packageAsset = await PackageAsset.aggregate([
              {
                $match: {
                  assetNumber: saveAssetWithdrawTableArrayObject[i].assetNumber,
                  reserved: false,
                  status: "inStock",
                },
              },
              {
                $lookup: {
                  from: "assets",
                  let: { packageAssetId: "$_id" }, // define a variable to store the PackageAsset _id
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$packageAssetId", "$$packageAssetId"], // reference the correct field name here
                        },
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                      },
                    },
                  ],
                  as: "asset",
                },
              },
            ]);
            // console.log(111111111111);
            // console.log(packageAsset);
            packageAssetIdHasAssetNumberArray.push(packageAsset[0]._id);

            await PackageAsset.findOneAndUpdate(
              {
                assetNumber: saveAssetWithdrawTableArrayObject[i].assetNumber,
              },
              { reserved: true },
              {
                returnOriginal: false,
              }
            );

            const packageAssetId = packageAsset[0]._id;
            // console.log(102,"packageAssetId",packageAssetId)
            // console.log("packageAsset.asset",packageAsset[0].asset)
            updatePackageAssetIdArray.push({ packageAssetId });

            if (packageAsset[0].asset.length > 0) {
              for (let k = 0; k < packageAsset[0].asset.length; k++) {
                // console.log(assetId)
                let assetId = packageAsset[0].asset[k]._id;
                console.log("assetId", assetId);
                let a = await Asset.findOneAndUpdate(
                  {
                    _id: assetId,
                  },
                  { reserved: true },
                  {
                    returnOriginal: false,
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
            const asset = await Asset.findOneAndUpdate(
              {
                assetNumber: saveAssetWithdrawTableArrayObject[i].assetNumber,
              },
              { reserved: true },
              {
                returnOriginal: false,
              }
            );
            assetIdHasAssetNumberArray.push(asset._id);
            // console.log("asset", asset);
            const assetId = asset._id;
            updateAssetIdArray.push({ assetId });
            // console.log("assetId", assetId);
          }
        } else {
          // else not have specific assetNumber
          if (saveAssetWithdrawTableArrayObject[i].isPackage) {
            // isPackage === true
            // console.log(3333333333333);
            // console.log(saveAssetWithdrawTableArrayObject[i]);

            let packageAsset = await PackageAsset.aggregate([
              {
                $match: {
                  productName: saveAssetWithdrawTableArrayObject[i].productName,
                  reserved: false,
                  status: "inStock",
                  _id: {
                    $nin: packageAssetIdHasAssetNumberArray, // not include in packageAssetIdHasAssetNumberArray that have contain packageAssetId that has assetNumber
                  },
                },
              },
              {
                $lookup: {
                  from: "assets",
                  let: { packageAssetId: "$_id" }, // define a variable to store the PackageAsset _id
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$packageAssetId", "$$packageAssetId"], // reference the correct field name here
                        },
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                      },
                    },
                  ],
                  as: "asset",
                },
              },
              {
                $limit: +saveAssetWithdrawTableArrayObject[i].amount,
              },
            ]);
            // console.log(packageAsset);
            // console.log(packageAsset.length);

            // loop packageAsset Array and update all child reserved:true
            for (let j = 0; j < packageAsset.length; j++) {
              let eachPackageAsset = packageAsset[j];
              let packageAssetId = eachPackageAsset._id;
              updatePackageAssetIdArray.push({ packageAssetId });

              await PackageAsset.findOneAndUpdate(
                {
                  _id: packageAssetId,
                },
                { reserved: true },
                {
                  returnOriginal: false,
                }
              );
              console.log("packageAssetId", packageAssetId);
              // console.log(packageAsset[j].asset)
              if (eachPackageAsset.asset.length > 0) {
                for (let k = 0; k < eachPackageAsset.asset.length; k++) {
                  // console.log(assetId)
                  let assetId = eachPackageAsset.asset[k]._id;
                  console.log("assetId", assetId);
                  let a = await Asset.findOneAndUpdate(
                    {
                      _id: assetId,
                    },
                    { reserved: true },
                    {
                      returnOriginal: false,
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
            let asset = await Asset.find({
              productName: saveAssetWithdrawTableArrayObject[i].productName,
              reserved: false,
              status: "inStock",
              _id: {
                $nin: assetIdHasAssetNumberArray, // not include in assetIdHasAssetNumberArray that have contain packageAssetId that has assetNumber
              },
            }).limit(+saveAssetWithdrawTableArrayObject[i].amount);
            console.log("asset /n", asset);

            for (let j = 0; j < asset.length; j++) {
              let eachAsset = asset[j];
              let assetId = eachAsset._id;

              await Asset.findOneAndUpdate(
                {
                  _id: assetId,
                },
                { reserved: true },
                {
                  returnOriginal: false,
                }
              );

              updateAssetIdArray.push({ assetId });
              // console.log("eachAsset",eachAsset)
            }
          }
        }
      }
    }

    borrowById = await Borrow.findById(borrowId);
    if (borrowById.status != "saveDraft") {
      // for delete assetId or packageAssetId
      for (let i = 0; i < deleteAssetArrayObject?.length; i++) {
        if (deleteAssetArrayObject[i].isPackage) {
          console.log("deleteAssetArrayObject[i]", deleteAssetArrayObject[i]);

          let packageAssetById = await PackageAsset.aggregate([
            {
              $match: {
                assetNumber: deleteAssetArrayObject[i].assetNumber,
                reserved: true,
                status: "inStock",
              },
            },
            {
              $lookup: {
                from: "assets",
                let: { packageAssetId: "$_id" }, // define a variable to store the PackageAsset _id
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$packageAssetId", "$$packageAssetId"], // reference the correct field name here
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                    },
                  },
                ],
                as: "asset",
              },
            },
          ]);
          console.log(packageAssetById);
          console.log(packageAssetById[0].asset);
          let assetInPackageAssetArray = packageAssetById[0].asset;

          // let packageAssetById = await PackageAsset.find({
          //   assetNumber: deleteAssetArrayObject[i].assetNumber,
          // });
          let packageAssetId = packageAssetById[0]._id;
          console.log(packageAssetId);

          await PackageAsset.findOneAndUpdate(
            {
              _id: packageAssetId,
            },
            { reserved: false },
            {
              returnOriginal: false,
            }
          );

          for (let j = 0; j < assetInPackageAssetArray.length; i++) {
            await Asset.findOneAndUpdate(
              {
                _id: assetInPackageAssetArray[j]._id,
              },
              { reserved: false },
              {
                returnOriginal: false,
              }
            );
          }

          await Borrow.updateOne(
            { _id: borrowById },
            {
              $pull: {
                packageAssetIdArray: { packageAssetId: packageAssetId },
              },
            }
          );
        } else {
          let assetById = await Asset.find({
            assetNumber: deleteAssetArrayObject[i].assetNumber,
          });
          let assetId = assetById[0]._id;

          // console.log(assetId);

          await Asset.findOneAndUpdate(
            {
              _id: assetId,
            },
            { reserved: false },
            {
              returnOriginal: false,
            }
          );

          await Borrow.updateOne(
            { _id: borrowById },
            { $pull: { assetIdArray: { assetId: assetId } } }
          );
        }
      }
    }
    console.log("updateAssetIdArray", updateAssetIdArray);
    borrowById = await Borrow.findById(borrowId);

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
      borrowById.assetIdArray = updateAssetIdArray;
      borrowById.packageAssetIdArray = updatePackageAssetIdArray;
      borrowById.assetWithDrawTableArray = [];
    } else {
      const oldAssetIdArray = borrowById.assetIdArray;
      const newAssetIdArray = oldAssetIdArray.concat(updateAssetIdArray);
      borrowById.assetIdArray = newAssetIdArray;
      const oldPackageAssetIdArray = borrowById.packageAssetIdArray;
      const newPackageAssetIdArray = oldPackageAssetIdArray.concat(
        updatePackageAssetIdArray
      );
      borrowById.packageAssetIdArray = newPackageAssetIdArray;
    }
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
    const borrow = await Borrow.findById({ _id: borrowId });
    console.log(borrow);
    if (borrow.status == "saveDraft") {
      await Borrow.deleteOne({ _id: borrowId });
    } else {
      borrow.deletedAt = new Date();
      borrow.reason = reason;
      await borrow.save();

      if (borrow.assetIdArray) {
        for (let i = 0; i < borrow.assetIdArray.length; i++) {
          let assetId = borrow.assetIdArray[i].assetId;
          // console.log(assetId)
          await Asset.findOneAndUpdate(
            {
              _id: assetId,
            },
            { reserved: false },
            {
              returnOriginal: false,
            }
          );
          // console.log(asset)
        }
      }

      if (borrow.packageAssetIdArray) {
        for (let i = 0; i < borrow.packageAssetIdArray.length; i++) {
          let packageAssetId = borrow.packageAssetIdArray[i].packageAssetId;
          // console.log(packageAssetId)
          let packageAsset = await PackageAsset.aggregate([
            { $match: { _id: ObjectID(packageAssetId) } },
            {
              $lookup: {
                from: "assets",
                localField: "_id",
                foreignField: "packageAssetId",
                as: "asset",
              },
            },
          ]);

          let findForUpdatePackageAsset = await PackageAsset.findByIdAndUpdate(
            {
              _id: packageAssetId,
            },
            { reserved: false },
            {
              returnOriginal: false,
            }
          );
          console.log("findForUpdatePackageAsset", findForUpdatePackageAsset);

          let assetInPackageArray = packageAsset[0].asset;
          // console.log("assetInPackageArray",i)
          // console.log(assetInPackageArray)
          if (assetInPackageArray.length > 0) {
            for (let j = 0; j < assetInPackageArray.length; j++) {
              // console.log(assetInPackageArray[j]._id)
              await Asset.findOneAndUpdate(
                {
                  _id: assetInPackageArray[j]._id,
                },
                { reserved: false },
                {
                  returnOriginal: false,
                }
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
    // for 2 field search
    const assetNumber = req.query.assetNumber || "";
    const status = req.query.status || "";
    const borrowDate = req.query.createdAt || "";
    const borrowEndDate = req.query.createdAt || "";
    const sector = req.query.sector || "";
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10;
    console.log(status);
    let query = {};

    if (borrowDate !== "") {
      query["createdAt"] = {
        $gte: borrowDate,
        $lte: moment(today).endOf("day").toDate(),
      };
    }
    if (borrowEndDate !== "") {
      query["createdAt"] = {
        $lte: borrowEndDate,
      };
    }
    if (borrowDate !== "" && borrowEndDate !== "") {
      query["createdAt"] = {
        $gte: borrowDate,
        $lte: borrowEndDate,
      };
    }
    // for 2 field search
    if (assetNumber !== "") {
      query["assetNumber"] = { $regex: assetNumber, $options: "i" };
    }
    if (status !== "") {
      query["status"] = {
        $regex: status,
        $options: "i",
      };
    }
    if (sector !== "") {
      query["sector"] = sector;
    }

    query["deletedAt"] = { $eq: null };

    const borrow = await Borrow.find(query)
      .skip(page * limit)
      .limit(limit);

    // for show how many pages
    const total = await Borrow.countDocuments(query);

    // console.log(borrow);
    res.json({ borrow, page: page + 1, limit, total });
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

    let query = {};

    if (textSearch !== "") {
      query[typeTextSearch] = { $regex: textSearch, $options: "i" };
    }

    if (status !== "") {
      if (status === "all") {
      } else {
        query["status"] = status;
      }
    }

    if (dateFrom !== "") {
      query["createdAt"] = {
        $gte: modifiedDateFrom,
        $lte: moment().endOf("day").toDate(),
      };
    }
    if (dateTo !== "") {
      query["createdAt"] = {
        $lte: modifiedDateTo,
      };
    }
    if (dateFrom !== "" && dateTo !== "") {
      query["createdAt"] = {
        $gte: modifiedDateFrom,
        $lte: modifiedDateTo,
      };
    }
    if (sector !== "") {
      query["sector"] = sector;
    }

    query["deletedAt"] = { $eq: null };

    console.log(query, "query");
    const borrow = await Borrow.find(query)
      .sort({ updatedAt: -1 })
      .skip(page * limit)
      .limit(limit);

    // console.log(asset)
    // for show how many pages
    const total = await Borrow.countDocuments(query);

    res.json({ borrow, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getSectorForSearch = async (req, res, next) => {
  try {
    const sector = await Borrow.aggregate([
      {
        $match: {
          $and: [
            { deletedAt: { $eq: null } },
            { sector: { $ne: null } },
            { sector: { $ne: "" } },
          ],
        },
      },
      {
        $group: {
          _id: { sector: "$sector" },
          numberOfzipcodes: { $sum: 1 },
        },
      },
      {
        $project: {
          sector: "$_id.sector",
          numberOfzipcodes: "$numberOfzipcodes",
          _id: 0,
        },
      },
      {
        $sort: {
          sector: 1,
        },
      },
    ]);
    res.json({ sector });
  } catch (err) {
    next(err);
  }
};

exports.getSectorForSearchCheckReturnBorrow = async (req, res, next) => {
  try {
    const sector = await Borrow.aggregate([
      {
        $match: {
          $and: [
            { deletedAt: { $eq: null } },
            { sector: { $ne: null } },
            { status: { $in: ["watingReturnApprove", "partiallyReturn"] } },
          ],
        },
      },
      {
        $group: {
          _id: { sector: "$sector" },
          numberOfzipcodes: { $sum: 1 },
        },
      },
      {
        $project: {
          sector: "$_id.sector",
          numberOfzipcodes: "$numberOfzipcodes",
          _id: 0,
        },
      },
      {
        $sort: {
          sector: 1,
        },
      },
    ]);
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

    let query = {};

    // if (status !== "") {
    //   if (status === "all") {
    //   } else {
    //     query["status"] = status;
    //   }
    // }

    if (dateFrom !== "") {
      query["createdAt"] = {
        $gte: dateFrom,
        $lte: moment().endOf("day").toDate(),
      };
    }
    if (dateTo !== "") {
      query["createdAt"] = {
        $lte: moment(dateTo).endOf("day").toDate(),
      };
    }
    if (dateFrom !== "" && dateTo !== "") {
      query["createdAt"] = {
        $gte: dateFrom,
        $lte: dateTo,
      };
    }
    if (sector !== "") {
      query["sector"] = sector;
    }

    query["deletedAt"] = { $eq: null };
    query["status"] = "waiting";
    console.log(query, "query");
    const topApproveList = await Borrow.find(query).sort({ updatedAt: -1 });

    query["status"] = { $in: splitList };
    console.log("bottom", query);
    const bottomApproveList = await Borrow.find(query).sort({
      dateTime_approver: -1,
    });

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

    const borrow = await Borrow.aggregate([
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

    res.json({ borrow: borrow[0] });
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

        await Borrow.findOneAndUpdate(
          { _id: borrowId },
          { status: "approve", dateTime_approver: new Date() },
          {
            returnOriginal: false,
          }
        );

        if (assetIdArray.length > 0) {
          for (let j = 0; j < assetIdArray.length; j++) {
            let assetId = assetIdArray[j].assetId;
            // console.log("assetId", assetId);
            let asset = await Asset.findOneAndUpdate(
              { _id: assetId },
              { status: "borrowed", reserved: false },
              {
                returnOriginal: false,
              }
            );
          }
        }

        if (packageAssetIdArray.length > 0) {
          for (let k = 0; k < packageAssetIdArray.length; k++) {
            let packageAssetId = packageAssetIdArray[k].packageAssetId;
            // console.log("packageAssetId", packageAssetId);
            let packageAsset = await PackageAsset.findOneAndUpdate(
              { _id: packageAssetId },
              { status: "borrowed", reserved: false },
              {
                returnOriginal: false,
              }
            );

            // console.log("/n/n");
            // console.log("packageAsset", packageAsset);
            let assetArray = await Asset.find({ packageAssetId });
            for (let l = 0; l < assetArray.length; l++) {
              let assetId = assetArray[l]._id;
              let asset = await Asset.findOneAndUpdate(
                { _id: assetId },
                { status: "borrowed", reserved: false },
                {
                  returnOriginal: false,
                }
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

        await Borrow.findOneAndUpdate(
          { _id: borrowId },
          {
            status: "reject",
            dateTime_approver: new Date(),
            reason: topApproveListObject[i].reason,
            assetIdArray,
            packageAssetIdArray,
          },
          {
            returnOriginal: false,
          }
        );

        if (assetIdArray.length > 0) {
          for (let j = 0; j < assetIdArray.length; j++) {
            let assetId = assetIdArray[j].assetId;
            // console.log("assetId", assetId);
            let asset = await Asset.findOneAndUpdate(
              { _id: assetId },
              { status: "inStock", reserved: false },
              {
                returnOriginal: false,
              }
            );
          }
        }

        if (packageAssetIdArray.length > 0) {
          for (let k = 0; k < packageAssetIdArray.length; k++) {
            let packageAssetId = packageAssetIdArray[k].packageAssetId;
            // console.log("packageAssetId", packageAssetId);
            let packageAsset = await PackageAsset.findOneAndUpdate(
              { _id: packageAssetId },
              { status: "inStock", reserved: false },
              {
                returnOriginal: false,
              }
            );

            // console.log("/n/n");
            // console.log("packageAsset", packageAsset);
            let assetArray = await Asset.find({ packageAssetId });
            for (let l = 0; l < assetArray.length; l++) {
              let assetId = assetArray[l]._id;
              let asset = await Asset.findOneAndUpdate(
                { _id: assetId },
                { status: "inStock", reserved: false },
                {
                  returnOriginal: false,
                }
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

    await Borrow.findOneAndUpdate(
      { _id: borrowId },
      {
        status: "reject",
        dateTime_approver: new Date(),
        reason: topApproveListObject.reason,
        assetIdArray,
        packageAssetIdArray,
      },
      {
        returnOriginal: false,
      }
    );

    if (assetIdArray.length > 0) {
      for (let j = 0; j < assetIdArray.length; j++) {
        let assetId = assetIdArray[j].assetId;
        // console.log("assetId", assetId);
        let asset = await Asset.findOneAndUpdate(
          { _id: assetId },
          { status: "inStock", reserved: false },
          {
            returnOriginal: false,
          }
        );
      }
    }

    if (packageAssetIdArray.length > 0) {
      for (let k = 0; k < packageAssetIdArray.length; k++) {
        let packageAssetId = packageAssetIdArray[k].packageAssetId;
        // console.log("packageAssetId", packageAssetId);
        let packageAsset = await PackageAsset.findOneAndUpdate(
          { _id: packageAssetId },
          { status: "inStock", reserved: false },
          {
            returnOriginal: false,
          }
        );

        let assetArray = await Asset.find({ packageAssetId });
        for (let l = 0; l < assetArray.length; l++) {
          let assetId = assetArray[l]._id;
          let asset = await Asset.findOneAndUpdate(
            { _id: assetId },
            { status: "inStock", reserved: false },
            {
              returnOriginal: false,
            }
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

    const assetIdArray = inputObject.assetIdArray;
    const packageAssetIdArray = inputObject.packageAssetIdArray;

    // console.log("borrowId", borrowId);
    // console.log("assetIdArray", assetIdArray);
    // console.log("packageAssetIdArray", packageAssetIdArray);

    // for check all reason have value
    const assetIdArrayReason = assetIdArray.every(
      (asset) => asset.reason !== ""
    );
    const packageAssetIdArrayReason = packageAssetIdArray.every(
      (asset) => asset.reason !== ""
    );

    if (assetIdArrayReason && packageAssetIdArrayReason) {
      // reject all
      await Borrow.findOneAndUpdate(
        { _id: borrowId },
        {
          status: "reject",
          dateTime_approver: new Date(),
          note: inputObject.note,
          assetIdArray,
          packageAssetIdArray,
        },
        {
          returnOriginal: false,
        }
      );

      for (el of assetIdArray) {
        // reject
        let assetId = el.assetId;
        await Asset.findOneAndUpdate(
          { _id: assetId },
          { status: "inStock", reserved: false },
          {
            returnOriginal: false,
          }
        );
      }

      // change all packageAsset status by id
      for (el of packageAssetIdArray) {
        let packageAssetId = el.packageAssetId;

        // reject
        await PackageAsset.findOneAndUpdate(
          { _id: packageAssetId },
          { status: "inStock", reserved: false },
          {
            returnOriginal: false,
          }
        );

        let assetArray = await Asset.find({ packageAssetId });
        for (let l = 0; l < assetArray.length; l++) {
          let assetId = assetArray[l]._id;
          await Asset.findOneAndUpdate(
            { _id: assetId },
            { status: "inStock", reserved: false },
            {
              returnOriginal: false,
            }
          );
        }
      }

      res.json({
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

        await Borrow.findOneAndUpdate(
          { _id: borrowId },
          {
            status: "partiallyApprove",
            dateTime_approver: new Date(),
            note: inputObject.note,
            assetIdArray,
            packageAssetIdArray,
          },
          {
            returnOriginal: false,
          }
        );

        // change all asset status by id
        for (el of assetIdArray) {
          let assetId = el.assetId;
          let reason = el.reason;

          if (reason !== "") {
            // reject
            await Asset.findOneAndUpdate(
              { _id: assetId },
              { status: "inStock", reserved: false },
              {
                returnOriginal: false,
              }
            );
          } else {
            // approve
            await Asset.findOneAndUpdate(
              { _id: assetId },
              { status: "borrowed", reserved: false },
              {
                returnOriginal: false,
              }
            );
          }
        }

        // change all packageAsset status by id
        for (el of packageAssetIdArray) {
          let packageAssetId = el.packageAssetId;
          let reason = el.reason;

          if (reason !== "") {
            // reject
            await PackageAsset.findOneAndUpdate(
              { _id: packageAssetId },
              { status: "inStock", reserved: false },
              {
                returnOriginal: false,
              }
            );

            let assetArray = await Asset.find({ packageAssetId });
            for (let l = 0; l < assetArray.length; l++) {
              let assetId = assetArray[l]._id;
              await Asset.findOneAndUpdate(
                { _id: assetId },
                { status: "inStock", reserved: false },
                {
                  returnOriginal: false,
                }
              );
            }
          } else {
            // approve
            await PackageAsset.findOneAndUpdate(
              { _id: packageAssetId },
              { status: "borrowed", reserved: false },
              {
                returnOriginal: false,
              }
            );

            let assetArray = await Asset.find({ packageAssetId });
            for (let l = 0; l < assetArray.length; l++) {
              let assetId = assetArray[l]._id;
              await Asset.findOneAndUpdate(
                { _id: assetId },
                { status: "inStock", reserved: false },
                {
                  returnOriginal: false,
                }
              );
            }
          }
        }

        res.json({
          message: "This borrowings has been successfully partially approved.",
        });
      } else {
        // approve all
        await Borrow.findOneAndUpdate(
          { _id: borrowId },
          {
            status: "approve",
            dateTime_approver: new Date(),
            note: inputObject.note,
            assetIdArray,
            packageAssetIdArray,
          },
          {
            returnOriginal: false,
          }
        );

        for (el of assetIdArray) {
          // reject
          let assetId = el.assetId;
          await Asset.findOneAndUpdate(
            { _id: assetId },
            { status: "borrowed", reserved: false },
            {
              returnOriginal: false,
            }
          );
        }

        // change all packageAsset status by id
        for (el of packageAssetIdArray) {
          let packageAssetId = el.packageAssetId;

          // reject
          await PackageAsset.findOneAndUpdate(
            { _id: packageAssetId },
            { status: "borrowed", reserved: false },
            {
              returnOriginal: false,
            }
          );

          let assetArray = await Asset.find({ packageAssetId });
          for (let l = 0; l < assetArray.length; l++) {
            let assetId = assetArray[l]._id;
            await Asset.findOneAndUpdate(
              { _id: assetId },
              { status: "borrowed", reserved: false },
              {
                returnOriginal: false,
              }
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

    await Borrow.findOneAndUpdate(
      { _id: borrowId },
      {
        status: "reject",
        dateTime_approver: new Date(),
        note: inputObject.note,
        reason: inputObject.reason,
        assetIdArray,
        packageAssetIdArray,
      },
      {
        returnOriginal: false,
      }
    );

    if (assetIdArray.length > 0) {
      for (let j = 0; j < assetIdArray.length; j++) {
        let assetId = assetIdArray[j].assetId;
        // console.log("assetId", assetId);
        await Asset.findOneAndUpdate(
          { _id: assetId },
          { status: "inStock", reserved: false },
          {
            returnOriginal: false,
          }
        );
      }
    }

    if (packageAssetIdArray.length > 0) {
      for (let k = 0; k < packageAssetIdArray.length; k++) {
        let packageAssetId = packageAssetIdArray[k].packageAssetId;
        // console.log("packageAssetId", packageAssetId);
        await PackageAsset.findOneAndUpdate(
          { _id: packageAssetId },
          { status: "inStock", reserved: false },
          {
            returnOriginal: false,
          }
        );

        let assetArray = await Asset.find({ packageAssetId });
        for (let l = 0; l < assetArray.length; l++) {
          let assetId = assetArray[l]._id;
          await Asset.findOneAndUpdate(
            { _id: assetId },
            { status: "inStock", reserved: false },
            {
              returnOriginal: false,
            }
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

    let query = {};
    let idArray = [];

    if (textSearch !== "") {
      if (typeTextSearch === "assetNumber") {
        let assetArray = await Asset.find({
          assetNumber: { $regex: textSearch, $options: "i" },
        });
        console.log("assetArray", assetArray);
        let packageAssetArray = await PackageAsset.find({
          assetNumber: { $regex: textSearch, $options: "i" },
        });
        console.log("packageAssetArray", packageAssetArray);

        idArray = assetArray
          .concat(packageAssetArray)
          .map((asset) => asset._id);

        if (idArray.length > 0) {
          query["$or"] = [
            { assetIdArray: { $elemMatch: { assetId: { $in: idArray } } } },
            {
              packageAssetIdArray: {
                $elemMatch: { packageAssetId: { $in: idArray } },
              },
            },
          ];
        }

        console.log(idArray);
        // const borrowIdArray = await Borrow.find()
        // res.json({
        //   assetArray,
        //   packageAssetArray,
        //   idArray,
        //   length: idArray.length,
        // });
      } else {
        query[typeTextSearch] = { $regex: textSearch, $options: "i" };
      }
    }

    if (dateFrom !== "") {
      query["borrowDate"] = {
        $gte: modifiedDateFrom,
        $lte: moment().endOf("day").toDate(),
      };
    }
    if (dateTo !== "") {
      query["borrowDate"] = {
        $lte: modifiedDateTo,
      };
    }
    if (dateFrom !== "" && dateTo !== "") {
      query["borrowDate"] = {
        $gte: modifiedDateFrom,
        $lte: modifiedDateTo,
      };
    }
    if (sector !== "") {
      query["sector"] = sector;
    }
    if (status !== "") {
      query["status"] = status;
    } else {
      query["status"] = {
        $in: [
          "approve",
          "partiallyApprove",
          "waitingReturnApprove",
          "partiallyReturn",
          "done",
        ],
      };
    }

    query["deletedAt"] = { $eq: null };

    console.log(query, "query");

    const borrow = await Borrow.find(query)
      .sort({ borrowReturnDate: -1 })
      .skip(page * limit)
      .limit(limit);

    // console.log(asset)
    // for show how many pages
    const total = await Borrow.countDocuments(query);

    res.json({ borrow, idArray, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getBorrowHistorySector = async (req, res, next) => {
  try {
    const sectors = await Borrow.aggregate([
      {
        $match: {
          sector: { $ne: null },
          status: {
            $in: [
              "approve",
              "partiallyApprove",
              "waitingReturnApprove",
              "partiallyReturn",
              "done",
            ],
          },
          deletedAt: { $eq: null },
        },
      },
      {
        $group: {
          _id: "$sector",
        },
      },
      {
        $project: {
          _id: 0,
          sector: "$_id",
        },
      },
    ]);

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

    let query = {};
    let idArray = [];

    if (textSearch !== "") {
      if (typeTextSearch === "assetNumber") {
        let assetArray = await Asset.find({
          assetNumber: { $regex: textSearch, $options: "i" },
        });
        console.log("assetArray", assetArray);
        let packageAssetArray = await PackageAsset.find({
          assetNumber: { $regex: textSearch, $options: "i" },
        });
        console.log("packageAssetArray", packageAssetArray);

        idArray = assetArray
          .concat(packageAssetArray)
          .map((asset) => asset._id);

        if (idArray.length > 0) {
          query["$or"] = [
            { assetIdArray: { $elemMatch: { assetId: { $in: idArray } } } },
            {
              packageAssetIdArray: {
                $elemMatch: { packageAssetId: { $in: idArray } },
              },
            },
          ];
        }

        console.log(idArray);
        // const borrowIdArray = await Borrow.find()
        // res.json({
        //   assetArray,
        //   packageAssetArray,
        //   idArray,
        //   length: idArray.length,
        // });
      } else {
        query[typeTextSearch] = { $regex: textSearch, $options: "i" };
      }
    }

    if (dateFrom !== "") {
      query["borrowDate"] = {
        $gte: modifiedDateFrom,
        $lte: moment().endOf("day").toDate(),
      };
    }
    if (dateTo !== "") {
      query["borrowDate"] = {
        $lte: modifiedDateTo,
      };
    }
    if (dateFrom !== "" && dateTo !== "") {
      query["borrowDate"] = {
        $gte: modifiedDateFrom,
        $lte: modifiedDateTo,
      };
    }
    if (sector !== "") {
      query["sector"] = sector;
    }
    if (status !== "") {
      query["status"] = status;
    } else {
      query["status"] = {
        $in: ["approve", "partiallyApprove", "done"],
      };
    }

    query["deletedAt"] = { $eq: null };

    console.log(query, "query");

    const borrow = await Borrow.find(query)
      .sort({ updatedAt: -1 })
      .skip(page * limit)
      .limit(limit);

    // console.log(asset)
    // for show how many pages
    const total = await Borrow.countDocuments(query);

    res.json({ borrow, idArray, page: page + 1, limit, total });
  } catch (err) {
    next(err);
  }
};

exports.getBorrowCheckSector = async (req, res, next) => {
  try {
    const sectors = await Borrow.aggregate([
      {
        $match: {
          sector: { $ne: null },
          status: {
            $in: [
              // "approve",
              // "partiallyApprove",
              "waitingReturnApprove",
              "partiallyReturn",
              "approveReturn",
            ],
          },
          deletedAt: { $eq: null },
        },
      },
      {
        $group: {
          _id: "$sector",
        },
      },
      {
        $project: {
          _id: 0,
          sector: "$_id",
        },
      },
    ]);

    res.json({ sectors });
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
    const { input } = req.body;
    // console.log(borrowId)

    // convert JSON to object
    const inputObject = JSON.parse(input);
    // console.log(inputObject);

    const assetIdArray = inputObject.assetIdArray;
    const packageAssetIdArray = inputObject.packageAssetIdArray;

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

    // return all for approve
    await Borrow.findOneAndUpdate(
      { _id: borrowId },
      {
        status: "waitingReturnApprove",
        assetIdArray,
        packageAssetIdArray,
      },
      {
        returnOriginal: false,
      }
    );

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

    const arrayImage = req?.files?.arrayImage || [];

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
    const borrowById = await Borrow.findById(borrowId);

    const oldImageArray = borrowById.imageArray;

    let notExistArrayImage = [];

    if (arrayImage.length > 0) {
      for (el of arrayImage) {
        await Borrow.updateOne(
          { _id: borrowId },
          { $push: { imageArray: { image: el.filename } } }
        );
      }
    }

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
      await Borrow.findOneAndUpdate(
        { _id: borrowId },
        {
          status: "done",
          borrowReturnDate: new Date(maxDate),
          assetIdArray,
          packageAssetIdArray,
        },
        {
          returnOriginal: false,
        }
      );

      for (let i = 0; i < assetIdArray.length; i++) {
        if (assetIdArray[i].return === "done") {
          await Asset.findByIdAndUpdate(
            { _id: assetIdArray[i].assetId },
            {
              status: "inStock",
            },
            {
              returnOriginal: false,
            }
          );
        }
      }
      for (let i = 0; i < packageAssetIdArray.length; i++) {
        if (packageAssetIdArray[i].return === "done") {
          await PackageAsset.findByIdAndUpdate(
            { _id: packageAssetIdArray[i].packageAssetId },
            {
              status: "inStock",
            },
            {
              returnOriginal: false,
            }
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
      await Borrow.findOneAndUpdate(
        { _id: borrowId },
        {
          status: "partiallyReturn",
          assetIdArray,
          packageAssetIdArray,
        },
        {
          returnOriginal: false,
        }
      );
      if (assetIdArraySomeReturn) {
        for (let i = 0; i < assetIdArray.length; i++) {
          if (assetIdArray[i].return === "done") {
            await Asset.findByIdAndUpdate(
              { _id: assetIdArray[i].assetId },
              {
                status: "inStock",
              },
              {
                returnOriginal: false,
              }
            );
          }
        }
      }
      if (packageAssetIdArraySomeReturn) {
        for (let i = 0; i < packageAssetIdArray.length; i++) {
          if (packageAssetIdArray[i].return === "done") {
            await PackageAsset.findByIdAndUpdate(
              { _id: packageAssetIdArray[i].packageAssetId },
              {
                status: "inStock",
              },
              {
                returnOriginal: false,
              }
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

    const borrows = await Borrow.find({
      "assetIdArray.assetId": assetId,
    }).select(
      "borrowIdDoc handler sector borrowDate borrowSetReturnDate borrowReturnDate status _id "
    );

    res.json({ borrows });
  } catch (err) {
    next(err);
  }
};

exports.getViewBorrowHistoryByPackageAssetId = async (req, res, next) => {
  try {
    const packageAssetId = req.params.packageAssetId;

    const borrows = await Borrow.find({
      "packageAssetIdArray.packageAssetId": packageAssetId,
    }).select(
      "borrowIdDoc handler sector borrowDate borrowSetReturnDate borrowReturnDate status _id "
    );

    res.json({ borrows });
  } catch (err) {
    next(err);
  }
};
