const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.engine("ejs", require("ejs").renderFile);
app.set("view engine", "ejs");

mongoose.set("strictQuery", true);

const mongoUrl = "mongodb://127.0.0.1:27017/f1";

const teamSchema = new mongoose.Schema({
  id: Number,
  name: String,
  nationality: String,
  url: String,
});

const driverSchema = new mongoose.Schema({
  num: Number,
  code: String,
  forename: String,
  surname: String,
  dob: Date,
  nationality: String,
  url: String,
  team: teamSchema,
});

const Team = mongoose.model("Team", teamSchema);
const Driver = mongoose.model("Driver", driverSchema);

let countries = [
  { code: "ENG", label: "England" },
  { code: "SPA", label: "Spain" },
  { code: "GER", label: "Germany" },
  { code: "FRA", label: "France" },
  { code: "MEX", label: "Mexico" },
  { code: "AUS", label: "Australia" },
  { code: "FIN", label: "Finland" },
  { code: "NET", label: "Netherlands" },
  { code: "CAN", label: "Canada" },
  { code: "MON", label: "Monaco" },
  { code: "THA", label: "Thailand" },
  { code: "JAP", label: "Japan" },
  { code: "CHI", label: "China" },
  { code: "USA", label: "USA" },
  { code: "DEN", label: "Denmark" },
];


function parseDateDMY(dmy) {
  if (!dmy) return null;
  const [d, m, y] = dmy.split("/").map(Number);
  return new Date(y, m - 1, d);
}

async function csvLoaderMiddleware(req, res, next) {
  try {
    const driverCount = await Driver.countDocuments();
    if (driverCount > 0) return next(); // already loaded

    const csvPath = path.join(__dirname, "public", "data", "f1_2023.csv");
    if (!fs.existsSync(csvPath)) return next();

    const teamsCache = {};
    const existingTeams = await Team.find({});
    existingTeams.forEach((t) => (teamsCache[t.name] = t));

    const rows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    for (const r of rows) {
      const teamName = r.current_team?.trim();
      let teamEmbed = null;

      if (teamName && teamName !== "N/A") {
        if (!teamsCache[teamName]) {
          const newTeam = new Team({
            id: (await Team.countDocuments()) + 1,
            name: teamName,
            nationality: r.nationality ?? "",
            url: "",
          });
          await newTeam.save();
          teamsCache[teamName] = newTeam;
        }

        const t0 = teamsCache[teamName];
        teamEmbed = {
          id: t0.id,
          name: t0.name,
          nationality: t0.nationality,
          url: t0.url,
        };
      }

      const driverDoc = new Driver({
        num: Number(r.number) || 0,          
        code: r.code || "",
        forename: r.forename || "",
        surname: r.surname || "",
        dob: parseDateDMY(r.dob),
        nationality: r.nationality || "",
        url: r.url || "",
        team: teamEmbed,
      });

      await driverDoc.save();
    }

    console.log(`CSV loaded: ${rows.length} drivers inserted.`);
    next();
  } catch (err) {
    console.error("CSV Middleware Error:", err);
    next();
  }
}

app.get("/", csvLoaderMiddleware, async (req, res) => {
  const drivers = await Driver.find({}).sort({ num: 1 }).lean();
  const teams = await Team.find({}).sort({ name: 1 }).lean();
  res.render("index", { drivers, teams, countries });
});

app.post("/api/driver", async (req, res) => {
  try {
    const body = req.body;

    if (body._id) {
      const d = await Driver.findById(body._id);
      if (!d) return res.status(404).json({ error: "Driver not found" });

      d.num = Number(body.num);
      d.code = body.code;
      d.forename = body.forename;
      d.surname = body.surname;
      d.dob = body.dob ? new Date(body.dob) : d.dob;
      d.nationality = body.nationality;
      d.url = body.url;

      if (body.team) {
        let teamDoc = await Team.findOne({ name: body.team });
        if (!teamDoc) {
          teamDoc = new Team({
            id: (await Team.countDocuments()) + 1,
            name: body.team,
            nationality: d.nationality,
            url: "",
          });
          await teamDoc.save();
        }
        d.team = teamDoc;
      } else {
        d.team = undefined;
      }

      await d.save();
      return res.json({ ok: true, doc: d });
    }

    let teamEmbed = undefined;
    if (body.team) {
      let teamDoc = await Team.findOne({ name: body.team });
      if (!teamDoc) {
        teamDoc = new Team({
          id: (await Team.countDocuments()) + 1,
          name: body.team,
          nationality: body.nationality,
          url: "",
        });
        await teamDoc.save();
      }
      teamEmbed = teamDoc;
    }

    const d = new Driver({
      num: Number(body.num),
      code: body.code,
      forename: body.forename,
      surname: body.surname,
      dob: body.dob ? new Date(body.dob) : null,
      nationality: body.nationality,
      url: body.url,
      team: teamEmbed,
    });

    await d.save();
    res.json({ ok: true, doc: d });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

app.delete("/api/driver/:id", async (req, res) => {
  const d = await Driver.findByIdAndDelete(req.params.id);
  if (!d) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

app.get("/api/drivers", async (req, res) => {
  res.json(await Driver.find({}).sort({ num: 1 }).lean());
});

app.get("/api/teams", async (req, res) => {
  res.json(await Team.find({}).sort({ name: 1 }).lean());
});

app.get("/api/nations", (req, res) => {
  res.json(countries);
});

const PORT = process.env.PORT || 3000;

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log("Listening on port", PORT));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
