import * as puppeteer from "puppeteer";
import fs from "fs";
import { characterFileName, skillFileName, assistSkillFileName } from "./const";
import {
  writeToFile,
  characterDataParser,
  skillDataParser,
  imgDownload,
  csvParser,
} from "./writer";

const selector: any = {
  character:
    "#fixed-nav-contents > div:nth-child(1) > div.entry-body > div:nth-child(8) > table tbody tr",
  skill: "table tbody tr:nth-of-type(-n+6) td",
  assistSkill: "table tbody tr td",
};

const dataParser = (
  id: number,
  dataType: string,
  selector: any,
  characterType?: string
): any => {
  const rowData: any = { id: id };
  const characterSelector: string = selector.character;
  if (dataType == "character") {
    const rows: NodeListOf<Element> =
      document.querySelectorAll(characterSelector);

    rows.forEach((row) => {
      const nameH: HTMLTableCellElement | null = row.querySelector("th");
      const value: HTMLTableCellElement | null = row.querySelector("td");

      if (typeof nameH?.innerText.trim() === "undefined") return;
      const name: string | undefined = nameH?.innerText.trim();
      if (name === "Skill") return;
      rowData[name] = value?.innerText.trim();
    });

    return rowData;
  }
  let skillSelector: string = selector.assistSkill;
  if (characterType === "Adventurer") skillSelector = selector.skill;

  const skillEN: Element | null | undefined =
    document.querySelector("#skill_en")?.nextElementSibling;
  if (!skillEN) return;
  const rows: NodeListOf<Element> = skillEN.querySelectorAll(skillSelector);
  rows.forEach((row) => {
    const name: HTMLElement | null = row.querySelector("strong");
    const value: HTMLHRElement | null = row.querySelector("hr");

    if (typeof name?.textContent?.trim() === "undefined") return;
    rowData[name.innerText.trim()] = value?.nextSibling?.textContent?.trim();
  });
  return rowData;
};

const looper = async (page: puppeteer.Page, counter: number) => {
  let ids: number[] = csvParser(characterFileName);
  while (true) {
    // if (counter == 10) return;
    if (ids.includes(counter)) {
      console.log(`${counter}: skipped`);
      counter++;
      continue;
    }
    ids.push(counter);
    const url: string = `https://danmemo.boom-app.wiki/entry/chara-${counter}`;
    const res: puppeteer.HTTPResponse | null = await page.goto(url);
    if (!res || res.status() === 404) return;
    const characterData: any = await page.evaluate(
      dataParser,
      counter,
      "character",
      selector
    );
    // console.log(characterData);
    const characterDataStr: string = characterDataParser(characterData);
    writeToFile(characterFileName, characterDataStr, counter);
    const skillData: any = await page.evaluate(
      dataParser,
      counter,
      "Skill",
      selector,
      characterData["Category"]
    );
    const skillDataStr: string = skillDataParser(skillData);
    characterData["Category"] === "Adventurer"
      ? writeToFile(skillFileName, skillDataStr, counter)
      : writeToFile(assistSkillFileName, skillDataStr, counter);

    const src: string | null | undefined = await page.evaluate(() => {
      const img: Element | null = document.querySelector(
        "#fixed-nav-contents > div:nth-child(1) > div.entry-body > div:nth-child(5) > div > div > img"
      );

      return img?.getAttribute("src");
    });
    if (typeof src !== "string") return;
    const viewSource: puppeteer.HTTPResponse | null = await page.goto(src);

    if (!viewSource) return;
    imgDownload(await viewSource.buffer(), counter);
    console.log(`${counter}: Success`);
    await new Promise((res) => setTimeout(res, 2000));
    counter++;
  }
};

async function run() {
  let browser: puppeteer.Browser | null = null;
  let counter: number = 1;
  try {
    browser = await puppeteer.launch({ headless: "new" });
    if (!browser) throw new Error("browser went oopsies");
    const page: puppeteer.Page = await browser.newPage();
    await looper(page, counter);
    console.log("Finished");
  } catch (err) {
    console.error(err);
  } finally {
    await browser?.close();
  }
}

run();
