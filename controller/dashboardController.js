const { Op } = require("sequelize");
const { asset } = require("../models");

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
        [Op.lte]: priceTo
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
      limit: 30
    });
    // console.log("assetData:", assetData);

    let listStatusOfRepair = [];
    let queryActiveAsset = {};

    listStatusOfRepair = ["repair", "saveDraft"];
    queryActiveAsset["status"] = { [Op.notIn]: listStatusOfRepair };
    queryActiveAsset["deletedAt"] = { [Op.eq]: null };
    queryActiveAsset["distributeApprovalReleaseDate"] = {
      [Op.eq]: null
    };

    let activeCount = await asset.count({
      where: queryActiveAsset
    });

    let queryDistributionAsset = {};
    queryDistributionAsset["distributeApprovalReleaseDate"] = {
      [Op.ne]: null
    };

    queryDistributionAsset["status"] = { [Op.ne]: "saveDraft" };
    queryDistributionAsset["deletedAt"] = { [Op.eq]: null };
    const distributionCount = await asset.count({
      where: queryDistributionAsset
    });

    let queryRepairAsset = {};
    queryRepairAsset["deletedAt"] = { [Op.eq]: null };
    queryRepairAsset["status"] = { [Op.eq]: "repair" };
    const repairCount = await asset.count({
      where: queryRepairAsset
    });

    let totalCount = activeCount + repairCount;
    console.log("totalCount:", totalCount);

    res.status(200).json({
      totalCount,
      activeCount,
      distributionCount,
      repairCount,
      assetData
    });

    res.status(200).json({ message: "sadad" });
  } catch (err) {
    next(err);
  }
};

exports.getRepairBySearch = async (req, res, next) => {
  try {
    console.log("getRepairBySearch:");
  } catch (err) {
    next(err);
  }
};
