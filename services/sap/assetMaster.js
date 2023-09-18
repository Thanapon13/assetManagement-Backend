const axios = require("axios");
// const https = require("https");

// const agent = new https.Agent({
//   rejectUnauthorized: false,
// });

// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
async function create(data, sessionId, routeId) {
  try {
    const response = await axios({
      method: "post",
      url: "https://203.154.157.31:50000/b1s/v1/Items",
      // timeout: 5000,
      headers: {
        // Path=/bts/v1; Secure; HttpOnly;
        // ROUTEID=.node0
        "Content-Type": "application/json",
        Cookie: `B1SESSION=${sessionId}; ROUTEID=.node4`,
      },
      data: JSON.stringify({
        ItemCode: data.ItemCode,
        ItemName: data.ItemName,
        ItemType: data.ItemType,
        AssetClass: data.AssetClass,
      }),

      // httpsAgent: agent,
    });
    return response;
  } catch (error) {
    console.error("Error Create AssetMaster data from API:", error);
    throw error;
  }
}

async function cancel(data, sessionId, routeId) {
  try {
    const response = await axios({
      method: "post",
      url: `https://203.154.157.31:50000/b1s/v1/Items(${data})/Cancel`,
      // timeout: 5000,
      headers: {
        "Content-Type": "application/json",
        Cookie: `B1SESSION=${sessionId}; ROUTEID=.node4`,
      },
    });
    return response;
  } catch (error) {
    console.error("Error Cancel AssetMaster data from API:", error);
    throw error;
  }
}

async function delete_assetMaster(data, sessionId, routeId) {
  try {
    const response = await axios({
      method: "delete",
      url: `https://203.154.157.31:50000/b1s/v1/Items(${data})`,
      // timeout: 5000,
      headers: {
        "Content-Type": "application/json",
        Cookie: `B1SESSION=${sessionId}; ROUTEID=.node4`,
      },
    });
    return response;
  } catch (error) {
    console.error("Error Delete AssetMaster data from API:", error);
    throw error;
  }
}

async function read(data, sessionId, routeId) {
  try {
    const response = await axios({
      method: "get",
      url: "https://203.154.157.31:50000/b1s/v1/Items",
      // timeout: 5000,
      headers: {
        // Path=/bts/v1; Secure; HttpOnly;
        // ROUTEID=.node0
        "Content-Type": "application/json",
        Cookie: `B1SESSION=${sessionId}; ROUTEID=.node4`,
      },
      params: data.params,

      // httpsAgent: agent,
    });

    return response;
  } catch (error) {
    console.error("Error Get AssetMaster data from API:", error);
    throw error;
  }
}

async function readCount(data, sessionId, routeId) {
  try {
    const response = await axios({
      method: "get",
      url: "https://203.154.157.31:50000/b1s/v1/Items/$count",
      // timeout: 5000,
      headers: {
        // Path=/bts/v1; Secure; HttpOnly;
        // ROUTEID=.node0
        "Content-Type": "application/json",
        Cookie: `B1SESSION=${sessionId}; ROUTEID=.node4`,
      },
      params: data.params,

      // httpsAgent: agent,
    });

    return response;
  } catch (error) {
    console.error("Error Get AssetMaster data from API:", error);
    throw error;
  }
}

module.exports = { create, cancel, delete_assetMaster, read,readCount };
