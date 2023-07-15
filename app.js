// const express = require("express");
// const logger = require("morgan");
// const cors = require("cors");
// const fs = require("fs");

// const contactsRouter = require("./routes/api/contacts");

// const app = express(); //create webserver

// const formatsLogger = app.get("env") === "development" ? "dev" : "short";

// app.use(logger(formatsLogger));
// app.use(cors());
// app.use(express.json());

// app.use("/api/contacts", contactsRouter);

// app.get("/", (req, res) => {
//   console.log(req.url);
//   console.log(req.method);
//   console.log(req.headers);
//   res.send(fs.readFileSync("index.html", "utf8"));
// });

// app.use((req, res) => {
//   res.status(404).json({ message: "Not found" });
// });

// app.use((err, req, res, next) => {
//   const { status = 500, message = "Server error" } = err;
//   res.status(status).json({ message: err.message });
//   console.error(err);
// });

// app.listen(3000, () => console.log("Server running at port 3000"));

// module.exports = app;
import express from "express";
import logger from "morgan";
import cors from "cors";

import contactsRouter from "./routes/api/contacts-router.js";

const app = express(); // app - web-server

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

app.get("/", (request, response) => {
  response.send("<h1>Home page</h1>");
});

app.get("/contacts", (request, response) => {
  console.log(request.url);
  console.log(request.method);
  response.send("<h1>Contacts page</h1>");
});

export default app;
