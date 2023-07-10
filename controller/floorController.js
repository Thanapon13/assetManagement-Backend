const Building = require("../models").building;
const Floor = require("../models").floor;

exports.createFloor = async (req, res, next) => {
  try {
    const { floorArray } = req.body;
    const resFloor = [];

    for (el of floorArray) {
      let building = await Building.findByPk(el.buildingId);

      if (building == null) {
        throw new Error(`Some building doesn't exist,Please try agian.`);
      }
    }

    for (el of floorArray) {
      let floor = await Floor.create({
        name: el.name,
        buildingId: el.buildingId,
      });
      resFloor.push(floor);
    }

    res.json({ resFloor });
  } catch (err) {
    next(err);
  }
};

exports.updateFloor = async (req, res, next) => {
  try {
    const { floorArray } = req.body;
    const resFloor = [];

    for (el of floorArray) {
      let floor = await Floor.findByPk(el.id);
      floor.name = el.name;
      await floor.save();
      resFloor.push(floor);
    }

    res.json({ resFloor });
  } catch (err) {
    next(err);
  }
};

exports.getAllFloor = async (req, res, next) => {
  try {
    // const floor = await Floor.aggregate([
    //   {
    //     $lookup: {
    //       from: "rooms",
    //       localField: "_id",
    //       foreignField: "floorId",
    //       as: "roomArray",
    //     },
    //   },
    // ]);
    // res.json({ floor });
  } catch (err) {
    next(err);
  }
};

exports.deleteFloor = async (req, res, next) => {
  try {
    const { id } = req.body;
    let floor = await Floor.destroy({
      where: {
        _id: _id,
      },
    });

    res.json({ floor });
    // Floor.findByPk(id, function (err, floor) {
    //   if (err) return next(err);
    //   floor.remove();
    //   res.json("delete successfully");
    // });
  } catch (err) {
    next(err);
  }
};
