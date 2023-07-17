const Building = require("../models").building;
const Floor = require("../models").floor;
const Room = require("../models").room;

exports.createRoom = async (req, res, next) => {
  try {
    const { roomArray } = req.body;
    const resRoom = [];

    for (el of roomArray) {
      let floor = await Floor.findByPk(el.floorId);

      if (floor == null) {
        throw new Error(`Some floor doesn't exist,Please try agian.`);
      }
    }

    for (el of roomArray) {
      let room = await Room.create({
        name: el.name,
        floorId: el.floorId,
      });
      resRoom.push(room);
    }

    res.json({ resRoom });
  } catch (err) {
    next(err);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const { roomArray } = req.body;
    const resRoom = [];

    for (el of roomArray) {
      let room = await Room.findByPk(el.id);
      room.name = el.name;
      await room.save();
      resRoom.push(room);
    }

    res.json({ resRoom });
  } catch (err) {
    next(err);
  }
};

exports.getAllRoom = async (req, res, next) => {
  try {
    const rooms = await Room.findAll({
      attributes: ["_id", "name"],
    });
    console.log(rooms);
    res.json({ rooms });
  } catch (err) {
    next(err);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.body;
    let room = await Room.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ room });
  } catch (err) {
    next(err);
  }
};
