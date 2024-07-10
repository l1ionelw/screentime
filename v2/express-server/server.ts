import timedStorageWriter from "./pre-init/timedStorageWriter";

const router = require("./api");
const logger = require('morgan');
import express from "express";

const app = express();
const PORT = 3000;

app.use(logger("dev"));
app.use(express.json());
app.use("/api", router);

console.log("initialize timed storage writer");
timedStorageWriter();

app.get("/", (req, res) => {
    console.log("hello")
    return res.send("hello");
})

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});