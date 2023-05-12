import * as fs from "fs";
import * as puppeteer from "puppeteer";
import { characterFileName, skillFileName, assistSkillFileName } from "./const";

function writeToFile(fileName: string, data: string, id: number): void {
  if (!fs.existsSync(fileName)) {
    let header: string =
      "id;name;character;category;rarity;type;element;ascension;method obtained";

    if (fileName === skillFileName) {
      header = "id;sa;saText;s1;s1Text;s2;s2Text;s3;s3Text";
    }

    if (fileName === assistSkillFileName) {
      header = "id;s1;s1Text;s2;s2Text;s3;s3Text";
    }
    fs.writeFileSync(fileName, header, "utf-8");
  }
  data = "\n" + data;
  try {
    fs.appendFileSync(fileName, data);
  } catch (err) {
    console.error(err);
  }
}

const stringFilter = (text: string): string => {
  const re = /\w+/g;
  const res: string | undefined = text.match(re)?.join(" ");
  if (typeof res === "undefined") throw new Error("regex went oopsie");
  return res;
};

const csvParser = (fileName: string): number[] => {
  const result: number[] = [];
  if (!fs.existsSync(fileName)) return result;
  const data: string[] = fs
    .readFileSync(fileName, "utf-8")
    .split("\n")
    .slice(1);
  for (const row of data) {
    const id: number = Number(row.split(";")[0]);
    result.push(id);
  }

  return result;
};

const characterDataParser = (data: any): string => {
  let res: string = "";
  for (const key in data) {
    let val = data[key];
    if (key === "Name" || key === "Rarity") val = stringFilter(val);
    if (data.Category === "Assist" && key === "Method Obtained") {
      res += `;;;${val};`;
      break;
    }
    res += `${val};`;
  }
  res = res.substring(0, res.length - 1);
  return res;
};

const skillDataParser = (data: any): string => {
  let res: string = `${data.id};`;
  for (const key in data) {
    if (key == "id") continue;
    res += `${key};${data[key]};`;
  }
  res = res.substring(0, res.length - 1);
  return res;
};

const imgDownload = async (buffer: Buffer, counter: number) => {
  fs.writeFile(
    `./img/${counter}.png`,
    buffer,
    function (err: NodeJS.ErrnoException | null) {
      err ? console.error(err) : null;
    }
  );
};

// const fd = fs.openSync(fileName, "r+");
// setImmediate(() => {
//   fs.close(fd, (err: NodeJS.ErrnoException | null) => {
//     if (err) throw err;
//     console.log("File closed");
//   });
// });

export {
  writeToFile,
  characterDataParser,
  skillDataParser,
  imgDownload,
  csvParser,
};
