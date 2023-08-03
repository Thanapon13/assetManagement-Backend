const axios = require("axios");
const https = require("https");
const fs = require("fs");
const { RequestError } = require("tedious");

const agent = new https.Agent({
  rejectUnauthorized: false,
});

async function login() {
  try {
    const response = await axios({
      method: "post",
      url: "https://203.154.157.31:50000/b1s/v1/Login",
      responseType: "json",
      timeout: 2000,
      Headers: {},
      data: {
        CompanyDB: process.env.SAP_COMPANYDB,
        UserName: process.env.SAP_USERNAME,
        Password: process.env.SAP_PASSWORD,
      },
      httpsAgent: agent,
    });
    // console.error("Error fetching data from API:", response);
    return response;
  } catch (error) {
    console.error("Error fetching data from API:", error.message);
    throw error;
  }
}

module.exports = { login };
