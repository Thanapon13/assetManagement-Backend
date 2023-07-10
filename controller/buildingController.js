// const Building = require("../models/buildingModel");
// const Floor = require("../models/floorModel");
const Building = require("../models").building;
const Floor = require("../models").floor;
const Room = require("../models").room;
const createError = require("../utils/createError");
const { ObjectID } = require("bson");

exports.createBuilding = async (req, res, next) => {
  try {
    const { buildingArray } = req.body;
    const resBuilding = [];

    for (el of buildingArray) {
      let building = await Building.create({
        name: el.name,
      });
      resBuilding.push(building);
    }

    res.json({ resBuilding });
  } catch (err) {
    next(err);
  }
};

exports.updateBuilding = async (req, res, next) => {
  try {
    const { buildingArray } = req.body;
    const resBuilding = [];

    for (el of buildingArray) {
      let building = await Building.findById(el.id);
      building.name = el.name;
      await building.save();
      resBuilding.push(building);
    }

    res.json({ resBuilding });
  } catch (err) {
    next(err);
  }
};

exports.getAllBuilding = async (req, res, next) => {
  try {
    const buildings = await Building.aggregate([
      {
        $lookup: {
          from: "floors",
          localField: "_id",
          foreignField: "buildingId",
          as: "floors",
        },
      },
      {
        $unwind: "$floors",
      },
      {
        $lookup: {
          from: "rooms",
          localField: "floors._id",
          foreignField: "floorId",
          as: "floors.rooms",
        },
      },

      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          createdAt: { $first: "$createdAt" },
          floors: { $push: "$floors" },
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },

      {
        $project: {
          _id: 1,
          name: 1,
          floors: {
            _id: 1,
            name: 1,
            rooms: {
              name: 1,
              _id: 1,
            },
          },
        },
      },
    ]);

    res.json(buildings);
  } catch (err) {
    next(err);
  }
};

exports.createOrUpdateBuilding = async (req, res, next) => {
  try {
    const { buildingObj } = req.body;

    // console.log(109,buildingObj)

    const existingNameBuilding = await Building.findOne({
      where: {
        name: buildingObj.name,
      },
    });

    if (buildingObj._id) {
      // update or create some change
      if (existingNameBuilding && existingNameBuilding.id !== buildingObj._id) {
        throw createError(
          `Building with name '${buildingObj.name}' already exists`,
          400
        );
      }

      const building = await Building.update(
        { name: buildingObj.name },

        { _id: buildingObj._id }
      );
      console.log(141, building);

      // floor sector ______________________________________________________

      for (const floors of buildingObj.floors) {
        const floorId = floors._id;
        const floorName = floors.name;

        if (floorId) {
          // update floor
          await Floor.update(
            { name: floorName },
            { _id: floorId },
           
          );

          // room sector ________________________________________________________

          for (const room of floors.rooms) {
            const roomId = room._id;
            console.log(153, roomId);
            const roomName = room.name;

            if (roomId) {
              // update room
              await Room.findOneAndUpdate(
                { name: roomName },

                { _id: roomId },
               
              );
              console.log(192, room);
            } else {
              // create room
              console.log(167, floorId);
              await Room.create({ name: roomName, floorId });
            }
          }
        } else {
          // create floor

          const floor = await Floor.create({
            name: floorName,
            buildingId: building._id,
          });

          // room sector ________________________________________________________

          // console.log(182,floors)
          for (const room of floors.rooms) {
            const roomId = room._id;
            const roomName = room.name;

            if (roomId) {
              // update room
              await Room.findOneAndUpdate(
                { _id: roomId },
                { name: roomName },
                {
                  returnOriginal: false,
                }
              );
            } else {
              // create room
              await Room.create({ name: roomName, floorId: floor.id });
            }
          }
        }
      }

      res.json("update successfully");
    } else {
      // create all
      if (existingNameBuilding) {
        throw createError(
          `Building with name '${buildingObj.name}' already exists`,
          400
        );
      }

      const building = await Building.create({ name: buildingObj.name });
      for (const floors of buildingObj.floors) {
        const floorName = floors.name;

        const floor = await Floor.create({
          name: floorName,
          buildingId: building._id,
        });

        for (const room of floors.rooms) {
          const roomName = room.name;

          await Room.create({ name: roomName, floorId: floor.id });
        }
      }

      res.json("create successfully");
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteBuilding = async (req, res, next) => {
  try {
    const buildingId = req.params.buildingId;
    await Building.deleteMany({ _id: buildingId });

    let floorIdArray = await Floor.find({
      buildingId,
    }).select("_id");

    await Floor.deleteMany({ buildingId });

    await Room.deleteMany({
      floorId: {
        $in: floorIdArray,
      },
    });

    res.json(`delete buildingId: ${buildingId} successfully`);
  } catch (err) {
    next(err);
  }
};

exports.deleteFloor = async (req, res, next) => {
  try {
    const floorId = req.params.floorId;
    console.log(floorId);

    await Floor.deleteOne({ _id: floorId });

    await Room.deleteMany({
      floorId,
    });

    res.json(`delete floorId: ${floorId} successfully`);
  } catch (err) {
    next(err);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const roomId = req.params.roomId;
    await Room.deleteOne({ _id: roomId });

    res.json(`delete roomId: ${roomId} successfully`);
  } catch (err) {
    next(err);
  }
};
