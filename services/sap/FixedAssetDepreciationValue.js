const axios = require("axios");
async function sqlQuery(data, sessionId, routeId) {
  try {
    const response = await axios({
      method: "get",
      url: "https://203.154.157.31:50000/b1s/v1/SQLQueries('SL_FADepre')/List",
      // timeout: 5000,
      headers: {
        "Content-Type": "application/json",
        Cookie: `B1SESSION=${sessionId}; ROUTEID=.node4`,
      },
      params: data.params,
    });
    return response;
  } catch (error) {
    console.error("Error Get FixedAssetDepreciationValue from API:", error);
    throw error;
  }
}

module.exports = { sqlQuery };
