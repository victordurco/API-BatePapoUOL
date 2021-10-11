import express from "express";
import cors from "cors";

const app = express(); // cria um servidor
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(4000);
