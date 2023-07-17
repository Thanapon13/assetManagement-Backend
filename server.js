// const { sequelize } = require("./models");
// sequelize.sync({ force: true });
// sequelize.sync({ alter: true });

const express = require("express");
const dotenv = require("dotenv").config();
const helmet = require("helmet");
const cors = require("cors");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// const authRoute = require("./route/authRoutes");
const packageAssetRoute = require("./route/packageAssetRoute");
const assetRoute = require("./route/assetRoute");
// const borrowRoute = require("./route/borrowRoute");
// const withdrawRoute = require("./route/withdrawRoute");
// const transferRoute = require("./route/transferRoute");
// const repairRoute = require("./route/repairRoute");
// const merchantRoute = require("./route/merchantRoute");
// const roleRoute = require("./route/roleRoute");
// const dashboardRoute = require("./route/dashboardRoute");
// dropdown
const buildingRoute = require("./route/buildingRoute");
const floorRoute = require("./route/floorRoute");
const roomRoute = require("./route/roomRoute");
const typeRoute = require("./route/typeRoute");
const kindRoute = require("./route/kindRoute");
const categoryRoute = require("./route/categoryRoute");
const brandRoute = require("./route/brandRoute");
const departmentRoute = require("./route/departmentRoute");
const sectorRoute = require("./route/sectorRoute");
const type4Route = require("./route/type4Route");
const type8Route = require("./route/type8Route");
const type13Route = require("./route/type13Route");
const groupRoute = require("./route/groupRoute");
const repairSectorRoute = require("./route/repairSectorRoute");
const subSectorRoute = require("./route/subSectorRoute");
const acquiredTypeRoute = require("./route/acquiredTypeRoute");
const sourceRoute = require("./route/sourceRoute");
const purposeOfUseRoute = require("./route/purposeOfUseRoute");
const acquisitionMethodRoute = require("./route/acquisitionMethodRoute");
const moneyTypeRoute = require("./route/moneyTypeRoute");
const borrowPurposeRoute = require("./route/borrowPurposeRoute");
const companyPrefixRoute = require("./route/companyPrefixRoute");
const thaiPrefixRoute = require("./route/thaiPrefixRoute");
const engPrefixRoute = require("./route/engPrefixRoute");
const personnelTypeCodeRoute = require("./route/personnelTypeCodeRoute");
const hospitalRoute = require("./route/hospitalRoute");
const docterTypeRoute = require("./route/docterTypeRoute");
const medicalFieldRoute = require("./route/medicalFieldRoute");
const countingUnitRoute = require("./route/countingUnitRoute");

const db = require("./models/index");
db.sequelize.sync();
app.use(helmet());
app.use(cors());
// app.use(cors({
//   origin: '*',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/images", express.static("public/pics"));
// app.use("/documents", express.static("public/documents"));
// app.use("/user", require("./route/userRoute"));
app.use("/asset", assetRoute);
app.use("/packageAsset", packageAssetRoute);
// app.use("/borrow", borrowRoute);
// app.use("/withdraw", withdrawRoute);
// app.use("/transfer", transferRoute);
// app.use("/repair", repairRoute);
// app.use("/merchant", merchantRoute);
// app.use("/role", roleRoute);
// app.use("/dashboard", dashboardRoute);
// dropdown
app.use("/building", buildingRoute);
app.use("/floor", floorRoute);
app.use("/room", roomRoute);
app.use("/type", typeRoute);
app.use("/kind", kindRoute);
app.use("/category", categoryRoute);
app.use("/sector", sectorRoute);
app.use("/type4", type4Route);
app.use("/type8", type8Route);
app.use("/type13", type13Route);
app.use("/group", groupRoute);
app.use("/brand", brandRoute);
app.use("/department", departmentRoute);
app.use("/subSector", subSectorRoute);
app.use("/acquiredType", acquiredTypeRoute);
app.use("/source", sourceRoute);
app.use("/purposeOfUse", purposeOfUseRoute);
app.use("/acquisitionMethod", acquisitionMethodRoute);
app.use("/moneyType", moneyTypeRoute);

app.use("/borrowPurpose", borrowPurposeRoute);
app.use("/companyPrefix", companyPrefixRoute);
app.use("/thaiPrefix", thaiPrefixRoute);
app.use("/engPrefix", engPrefixRoute);
app.use("/personnelTypeCode", personnelTypeCodeRoute);
app.use("/hospital", hospitalRoute);
app.use("/docterType", docterTypeRoute);
app.use("/medicalField", medicalFieldRoute);

app.use("/repairSector", repairSectorRoute);
app.use("/countingUnit", countingUnitRoute);

app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server starting at port :${port}`);
});
