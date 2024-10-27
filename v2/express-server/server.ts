import timedStorageWriter from "./pre-init/timedStorageWriter";

const router = require("./api");
const logger = require('morgan');
import express from "express";
import {JSON_FILE_DIR, JSON_FILE_PATH} from "./globals";
import checkJsonFileDate from "./pre-init/checkJsonFileDate";
const cors = require('cors');

const app = express();
let PORT = parseInt(process.argv[2]?.replace("--port=", ""));
if (PORT === undefined || !PORT) {
    PORT = 5000
}
app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use("/api", router);

console.log(JSON_FILE_PATH);
console.log(JSON_FILE_DIR);

checkJsonFileDate();
timedStorageWriter();

app.use("/assets", express.static("assets"));

app.get("/", (req, res) => {
    console.log("hello")
    return res.send("hello");
})

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});