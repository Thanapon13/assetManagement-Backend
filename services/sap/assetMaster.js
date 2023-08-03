const axios = require("axios");
const https = require("https");

const agent = new https.Agent({
  rejectUnauthorized: false,
});

async function create(data, sessionId, routeId) {
  try {
    const response = await axios({
      method: "post",
      url: "https://203.154.157.31:50000/b1s/v1/Items",
      timeout: 3000,
      Headers: {
        // Path=/bts/v1; Secure; HttpOnly;
        // ROUTEID=.node0
        Cookie: `B1SESSION=${sessionId}; ROUTEID=.node9`,
      },
      data: {
        ItemCode: data.ItemCode,
        ItemName: data.ItemName,
        ItemType: data.ItemType,
        AssetClass: data.AssetClass,
      },
      httpsAgent: agent,
    });
    return response;
  } catch (error) {
    console.error("Error fetching data from API:", error);
    throw error;
  }
}

async function view(data, sessionId) {
  try {
    const response = await axios({
      method: "get",
      url: "https://203.154.157.31:50000/b1s/v1/Items",
      responseType: "json",
      timeout: 1000,
      Headers: {
        Cookie: `B1SESSION=${sessionId}; ROUTEID=.node4`,
        "Content-Type": "application/json",
        Connection: "keep-alive",
      },
      params: {
        $filter: data.query,
      },
      httpsAgent: agent,
    });
    return response;
  } catch (error) {
    console.error("Error fetching data from API:", error.message);
    throw error;
  }
}

// function update(data, sessionId) {
//     axios({
//       method: "get",
//       url: "https://203.154.157.31:50000/b1s/v1/Items",
//       responseType: "json",
//       timeout: 1000,
//       Headers: {
//         Cookie: `B1SESSION=${sessionId}; ROUTEID=.node4`,
//         "Content-Type": "application/json",
//         Connection: "keep-alive",
//       },
//       params: {
//         $filter: data.query,
//       },
//       data: {
//         ItemCode: data.ItemCode,
//         ItemName: data.ItemName,
//         ItemType: data.ItemType,
//         AssetClass: data.AssetClass,
//       },
//     })
//       .then(function (response) {
//         console.log("response", response);
//         return false, response;
//       })
//       .catch(function (err) {
//         console.log("err", err);
//         return true, err;
//       });
//   }

module.exports = { create, view };
