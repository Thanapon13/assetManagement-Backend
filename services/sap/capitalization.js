const axios = require("axios");

async function create(data, sessionId) {
  try {
    const response = await axios({
      method: "post",
      url: "https://203.154.157.31:50000/b1s/v1/AssetCapitalization",
      headers: {
        Cookie: `B1SESSION=${sessionId}; ROUTEID=.node4`,
        "Content-Type": "application/json",
        Connection: "keep-alive",
      },
      data: {
        PostingDate: data.PostingDate,
        DocumentDate: data.DocumentDate,
        AssetValueDate: data.AssetValueDate,
        BPLId: data.BPLId,
        Remarks: data.Remarks,
        AssetDocumentLineCollection: data.AssetDocumentLineCollection,
        AssetDocumentAreaJournalCollection:
          data.AssetDocumentAreaJournalCollection,
      },
      // {
      //     "PostingDate": "2023-07-17",
      //     "DocumentDate": "2023-07-17",
      //     "AssetValueDate": "2023-07-17",
      //     "BPLId": "1",
      //     "Remarks": "Test Capitalization By Postman",
      //     "AssetDocumentLineCollection": [
      //         {
      //             "AssetNumber": "TEST_SAP02",
      //             "Quantity": 1,
      //             "TotalLC": 10000.0
      //         }
      //     ],
      //     "AssetDocumentAreaJournalCollection": [
      //         {
      //             "DepreciationArea": "TFRS",
      //             "JournalRemarks": "Capitalization-Test"
      //         }
      //     ]
      // }
    });
    return response;
  } catch (error) {
    console.error("Error Create Capitalization data from API:", error);
    throw error;
  }
}

function view(data, sessionId) {
  axios({
    method: "get",
    url: "https://203.154.157.31:50000/b1s/v1/AssetCapitalization",
    responseType: "json",
    timeout: 1000,
    headers: {
      Cookie: `B1SESSION=${sessionId}; ROUTEID=.node4`,
      "Content-Type": "application/json",
      Connection: "keep-alive",
    },
    params: {
      $filter: data.query,
    },
  })
    .then(function (response) {
      console.log("response", response);
      return false, response;
    })
    .catch(function (err) {
      console.log("err", err);
      return true, err;
    });
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
//      {
//     "Remarks" : "Test_Edit",
//     "AssetDocumentLineCollection": [
//         {
//             "LineNumber": 1,
//             "Remarks": "Remark is Test_Edit"
//         },
//         {
//             "LineNumber": 2,
//             "Remarks": "Remark is Test_Edit_2"
//         }
//     ]
// }

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

async function cancel(data, sessionId, routeId) {
  try {
    const response = await axios({
      method: "post",
      url: "https://203.154.157.31:50000/b1s/v1/AssetCapitalizationService_Cancel",
      // timeout: 5000,
      headers: {
        "Content-Type": "application/json",
        Cookie: `B1SESSION=${sessionId}; ROUTEID=.node4`,
      },
      data: JSON.stringify({
        AssetDocumentParams: data.AssetDocumentParams,
      }),
      //   {
      //     "AssetDocumentParams": {
      //         "CancellationOption": "coByOriginalDocumentDate",
      //         "": "1"
      //     }
      // }
    });
    return response;
  } catch (error) {
    console.error("Error Cancel Capitalization data from API:", error);
    throw error;
  }
}

module.exports = { create, view, cancel };
