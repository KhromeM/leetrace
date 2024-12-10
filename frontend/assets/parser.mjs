import fs from "fs";

const data = JSON.parse(fs.readFileSync("./data.json", { encoding: "utf-8" }));
data.sort((a, b) => a.ID - b.ID);
// console.log(data.length);
for (const obj of data.slice(0, 100)) {
	console.log(obj.ID);
}
