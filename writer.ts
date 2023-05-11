import * as fs from "fs";
import { characterFileName, skillFileName } from "./const";

function writeToFile(fileName: string, data: string) {
  if (!fs.existsSync(fileName)) {
    let header: string =
      "id,name,character,category,rarity,type,element,ascension,method obtained";

    if (fileName === skillFileName) {
      header = "id,sa,saText,s1,s1Text,s2,s2Text,s3,s3Text";
    }
    fs.writeFileSync(fileName, header, "utf-8");
    data = "\n" + data;
    try {
      fs.appendFileSync(fileName, data);
    } catch (err) {
      console.error(err);
    }
  }
}

const characterDataParser = (data: any): string => {
  let res: string = "";
  for (const key in data) {
    res += `${data[key]},`;
  }
  res = res.substring(0, res.length - 1);
  return res;
};

const skillDataParser = (data: any): string => {
  let res: string = `${data.id},`;
  for (const key in data) {
    if (key == "id") continue;
    res += `${key},${data[key]},`;
  }
  res = res.substring(0, res.length - 1);
  return res;
};

// const fd = fs.openSync(fileName, "r+");
// setImmediate(() => {
//   fs.close(fd, (err: NodeJS.ErrnoException | null) => {
//     if (err) throw err;
//     console.log("File closed");
//   });
// });

export { writeToFile, characterDataParser, skillDataParser };
