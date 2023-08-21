const { Op } = require("sequelize");
const { asset, repair } = require("../models");

exports.getAssetBySearch = async (req, res, next) => {
  try {
    // for 2 field search
    const typeTextSearch = req.query.typeTextSearch || "";
    const textSearch = req.query.textSearch || "";
    const status = req.query.status || "";
    const sector = req.query.sector || "";
    const price = req.query.price || "";
    const deliveryDocument = req.query.deliveryDocument || "";

    let query = {};

    if (textSearch !== "") {
      query[typeTextSearch] = { [Op.iLike]: `%${textSearch}%` };
    }

    if (status !== "") {
      query["status"] = status;
    } else {
      query["status"] = { [Op.notLike]: "saveDraft" };
    }

    query["deliveryDocument"] = { [Op.eq]: null };
    if (sector !== "") {
      query["sector"] = sector;
    }

    if (price !== "") {
      let priceSplit = price.split("-");
      const priceFrom = parseInt(priceSplit[0]);
      const priceTo = parseInt(priceSplit[1]);
      query["price"] = {
        [Op.gte]: priceFrom,
        [Op.lte]: priceTo,
      };
    }

    if (deliveryDocument !== "") {
      query["deliveryDocument"] = deliveryDocument;
    }
    query["deletedAt"] = { [Op.eq]: null };
    console.log(query, "query");

    const assetData = await asset.findAll({
      where: query,
      order: [["updatedAt", "DESC"]],
      limit: 30,
    });
    // console.log("assetData:", assetData);

    let listStatusOfRepair = [];
    let queryActiveAsset = {};

    listStatusOfRepair = ["repair", "saveDraft"];
    queryActiveAsset["status"] = { [Op.notIn]: listStatusOfRepair };
    queryActiveAsset["deletedAt"] = { [Op.eq]: null };
    queryActiveAsset["distributeStatus"] = {
      [Op.eq]: false,
    };

    let activeCount = await asset.count({
      where: queryActiveAsset,
    });

    let queryDistributionAsset = {};
    queryDistributionAsset["distributeStatus"] = {
      [Op.ne]: false,
    };

    queryDistributionAsset["status"] = { [Op.ne]: "saveDraft" };
    queryDistributionAsset["deletedAt"] = { [Op.eq]: null };
    const distributionCount = await asset.count({
      where: {
        distributeStatus: {
          [Op.ne]: false,
        },
        status: { [Op.not]: "saveDraft" },
        deletedAt: null,
      },
    });

    let queryRepairAsset = {};
    queryRepairAsset["deletedAt"] = { [Op.eq]: null };
    queryRepairAsset["status"] = { [Op.eq]: "repair" };
    const repairCount = await asset.count({
      where: queryRepairAsset,
    });

    let totalCount = activeCount + repairCount;
    console.log("totalCount:", totalCount);

    res.status(200).json({
      totalCount,
      activeCount,
      distributionCount,
      repairCount,
      assetData,
    });

    res.status(200).json({ message: "sadad" });
  } catch (err) {
    next(err);
  }
};

exports.getRepairBySearch = async (req, res, next) => {
  try {
    // for 2 field search
    const informRepairIdDoc = req.query.informRepairIdDoc || "";
    const assetNumber = req.query.assetNumber || "";
    const listTypeOfRepair =
      req.query.listTypeOfRepair ||
      "general,asset,project,computer,medicalEquipment";
    const status = req.query.status || "";
    const sector = req.query.sector || "";

    let query = {};

    if (informRepairIdDoc !== "") {
      query[informRepairIdDoc] = { [Op.iLike]: `%${textSearch}%` };
    }
    if (informRepairIdDoc !== "") {
      query[assetNumber] = { [Op.iLike]: `%${textSearch}%` };
    }

    if (status !== "") {
      query["status"] = { [Op.iLike]: `%${status}%`, [Op.not]: "saveDraft" };
    } else {
      query["status"] = { [Op.not]: "saveDraft" };
    }

    let listTypeOfRepairSplit = listTypeOfRepair.split(",");
    query["typeOfRepair"] = { [Op.in]: listTypeOfRepairSplit };

    if (sector !== "") {
      query["sector"] = sector;
    }
    query["deletedAt"] = { [Op.eq]: null };
    console.log(query, "query");

    const repairData = await repair.findAll({
      where: query,
      order: [["updatedAt", "DESC"]],
      limit: 30,
    });

    let listStatusOfRepair = [];
    let queryActiveAsset = {};

    listStatusOfRepair = ["repair", "saveDraft"];
    queryActiveAsset = {
      status: {
        [Op.notIn]: listStatusOfRepair,
      },
      deletedAt: {
        [Op.eq]: null,
      },
      distributeStatus: {
        [Op.eq]: false,
      },
    };

    const activeCount = await asset.count({
      where: {
        status: { [Op.notIn]: listStatusOfRepair },
        deletedAt: null,
        distributeStatus: false,
      },
    });
    console.log("activeCount:", activeCount);

    const distributionCount = await asset.count({
      where: {
        distributeStatus: { [Op.eq]: true },
        status: { [Op.not]: "saveDraft" },
        deletedAt: null,
      },
    });
    console.log("distributionCount:", distributionCount);

    const repairCount = await asset.count({
      where: {
        status: "repair",
        deletedAt: null,
      },
    });
    console.log("repairCount:", repairCount);

    const totalCount = activeCount + repairCount;

    res.json({
      totalCount,
      activeCount,
      distributionCount,
      repairCount,
      repairData,
    });
  } catch (err) {
    next(err);
  }
};
