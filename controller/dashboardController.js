const { asset } = require("../models");
const { Op } = require("sequelize");

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
      query["status"] = { [Op.notILike]: "saveDraft" };
    }

    query["purchaseContract.deliveryDocument"] = { [Op.eq]: null };

    if (sector !== "") {
      query["sector"] = sector;
    }
    if (price !== "") {
      let priceSplit = price.split("-");
      const priceFrom = parseInt(priceSplit[0]);
      const priceTo = parseInt(priceSplit[1]);
      query["purchaseContract.price"] = {
        [Op.gte]: priceFrom,
        [Op.lte]: priceTo
      };
    }

    if (deliveryDocument !== "") {
      query["purchaseContract.deliveryDocument"] = deliveryDocument;
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
    queryActiveAsset["distribution.distributeApprovalReleaseDate"] = {
      [Op.eq]: null
    };

    let activeCount = await asset.count({
      where: queryActiveAsset
    });
    let queryDistributionAsset = {};
    queryDistributionAsset["distribution.distributeApprovalReleaseDate"] = {
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

    res.status(200).json({
      totalCount,
      activeCount,
      distributionCount,
      repairCount,
      assetData
    });
  } catch (err) {
    next(err);
  }
};
