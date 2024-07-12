import checkAndWriteFile from "./checkAndWriteFIle";

export default function timedStorageWriter() {
    setInterval(()=> {
        console.log("interval ran");
        checkAndWriteFile();
    }, 300000) // 5 minutes
}