const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

const app = express();
const PORT = 3000;

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.set("views", path.join(__dirname, "html"));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));

let names = [];
let tasks = [];


app.get("/", (req, res) => {
  res.render("index", { names, error: null, tasks });
});

app.get("/greet", (req, res) => {
  const name = req.query.name?.trim();

  if (!name)
    return res.render("index", {
      names,
      error: "Please provide a name",
      tasks,
    });

  names.push(name);
  res.render("index", { names, error: null, tasks });
});

app.get("/wazzup/:index", (req, res, next) => {
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= names.length) {
    return next(new Error("Index out of range"));
  }
   const name = names[index];
  res.render("wazzup", { name });
});




app.put("/greet/:name", (req, res) => {
  const name = req.params.name.trim();
  if (!name) return res.status(400).json({ error: "Invalid name" });
  names.push(name);
  res.json({ names });
});


app.post("/task", (req, res) => {
  const { task } = req.body;
  if (!task) return res.redirect("/");
  tasks.push(task);
  res.redirect("/");
});

app.post ("/task/:index/move", (req, res) => {
    const { direction } = req.body;
    const index = parseInt(req.params.index);

    if (direction === "up" && index > 0) {
        [tasks[index - 1], tasks[index]] = [tasks[index], tasks[index - 1]];
    } else if (direction === "down" && index < tasks.length - 1) {
      [tasks[index], tasks[index + 1]] = [tasks[index + 1], tasks[index]];
    }

    res.redirect("/");
    });


app.delete("/task/:index", (req, res) => {
  const index = parseInt(req.params.index);
  if (!isNaN(index) && index >= 0 && index < tasks.length) {        
    tasks.splice(index, 1);
  }
  res.redirect("/");
});

app.get("/task", (req, res) => {
  res.json({ tasks });
});


app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500);
  res.render("index", { names, error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
