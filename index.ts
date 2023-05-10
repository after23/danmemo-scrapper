import * as puppeteer from "puppeteer";
import fs from "fs";

async function run() {
  let browser: puppeteer.Browser | null = null;
  let counter: number = 696;
  try {
    browser = await puppeteer.launch({ headless: "new" });
    const page: puppeteer.Page = await browser.newPage();
    let url: string = `https://danmemo.boom-app.wiki/entry/chara-${counter}`;
    const res: puppeteer.HTTPResponse | null = await page.goto(url);
    if (res?.status() == 404) {
      throw new Error("yeow");
    }

    const characterData: string = await page.evaluate((counter) => {
      const rows: NodeListOf<Element> = document.querySelectorAll(
        "#fixed-nav-contents > div:nth-child(1) > div.entry-body > div:nth-child(8) > table tbody tr"
      );

      const rowData: any = {};
      rowData["id"] = counter;
      rows.forEach((row) => {
        const nameH: HTMLTableCellElement | null = row.querySelector("th");
        const valueD: HTMLTableCellElement | null = row.querySelector("td");

        const name: string | undefined = nameH?.innerText.trim();
        const value: string | undefined = valueD?.innerText.trim();
        if (name == "Skill") return;
        name ? (rowData[name] = value) : null;
      });

      return JSON.stringify(rowData);
    }, counter);

    console.log(characterData);

    const skillData: string = await page.evaluate((counter) => {
      const rows: NodeListOf<Element> = document.querySelectorAll(
        "#fixed-nav-contents > div:nth-child(1) > div.entry-body > div:nth-child(40) > table tbody tr:nth-of-type(-n+6) td"
      );
      const rowData: any = { id: counter };
      rows.forEach((row) => {
        // const nameH = row.querySelector("strong")?.textContent.trim();
        const nameH: HTMLElement | null = row.querySelector("strong");
        const valueD: HTMLHRElement | null = row.querySelector("hr");
        // const valueD = row.querySelector("hr")?.nextSibling.textContent.trim();

        const name: string | undefined = nameH?.textContent?.trim();
        const value: string | undefined =
          valueD?.nextSibling?.textContent?.trim();
        name ? (rowData[name] = value) : null;
      });
      return JSON.stringify(rowData);
    }, counter);

    console.log(skillData);

    const src: string | null | undefined = await page.evaluate(() => {
      const img: Element | null = document.querySelector(
        "#fixed-nav-contents > div:nth-child(1) > div.entry-body > div:nth-child(5) > div > div > img"
      );

      return img?.getAttribute("src");
    });
    if (typeof src !== "string") return;
    let viewSource: puppeteer.HTTPResponse | null = await page.goto(src);

    if (viewSource) {
      fs.writeFile(
        `./img/${counter}.png`,
        await viewSource.buffer(),
        function (err: NodeJS.ErrnoException | null) {
          err ? console.log(err) : console.log("yeay");
        }
      );
    }
  } catch (err) {
    console.error(err);
  } finally {
    await browser?.close();
  }
}

run();
