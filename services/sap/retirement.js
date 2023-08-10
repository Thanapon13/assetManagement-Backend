const axios = require("axios");

async function create(data, sessionId, routeId) {
  try {
    const response = await axios({
      method: "post",
      url: "https://203.154.157.31:50000/b1s/v1/AssetRetirement",
      // timeout: 5000,
      headers: {
        "Content-Type": "application/json",
        Cookie: `B1SESSION=${sessionId}; ROUTEID=.node4`,
      },
      data: JSON.stringify({
        PostingDate: data.PostingDate,
        DocumentDate: data.DocumentDate,
        AssetValueDate: data.AssetValueDate,
        DocumentType: data.DocumentType,
        BPLId: data.BPLId,
        Remarks: data.Remarks,
        AssetDocumentLineCollection: data.AssetDocumentLineCollection,
      }),
      //   {
      //     "PostingDate" : "2023-08-04",
      //     "DocumentDate" : "2023-08-04",
      //     "AssetValueDate" : "2023-08-04",
      //     "DocumentType" : "adtScrapping",
      //     "BPLId" : "1",
      //     "Remarks" : "Test Retirement By Postman",
      //     "AssetDocumentLineCollection" : [
      //         {
      //             "AssetNumber" : "0013-0002/01"
      //         }
      //     ]
      // }
    });
    return response;
  } catch (error) {
    console.error("Error Create AssetMaster data from API:", error);
    throw error;
  }
}
