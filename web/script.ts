const fs = require("fs");
const json = fs.readFileSync("test.json","utf-8");
const data = JSON.parse(json);
console.log(data.test);