const axios = require("axios");

async function create(data, sessionId, routeId) {
  try {
    const response = await axios({
      method: "post",
      url: "https://203.154.157.31:50000/b1s/v1/AssetCapitalizationCreditMemo",
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
        AssetDocumentAreaJournalCollection:
          data.AssetDocumentAreaJournalCollection,
      }),
      //   {
      //     "PostingDate" : "2023-07-18",
      //     "DocumentDate" : "2023-07-18",
      //     "AssetValueDate" : "2023-07-18",
      //     "BPLId" : "1",
      //     "Remarks" : "Test Capitalization CreditMemo By Postman",
      //     "AssetDocumentLineCollection" : [
      //         {
      //             "LineNumber" : 1,
      //             "AssetNumber" : "TEST_SAP02",
      //             "Quantity" : 1,
      //             "TotalLC" : 1000.0
      //         }

      //     ],
      //     "AssetDocumentAreaJournalCollection": [
      //                 {
      //                     "DepreciationArea": "TFRS",
      //                     "JournalRemarks": "Capitalization Credit Memo-Test"
      //                 }
      //     ]
      // }
    });
    return response;
  } catch (error) {
    console.error("Error Create AssetMaster data from API:", error);
    throw error;
  }
}


