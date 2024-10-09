// Copyright 2024 SIL Global
// Types and utilities for to generate HTML file of verses in tables
import * as config from './config.js';
import * as fs from 'fs'
import * as path from 'path'
import * as puppeteer from 'puppeteer';

export class Html {
  // HTML template files
  public TEMPLATE_ROOT = "templates" + path.sep;
  public HEADER_IN = `${this.TEMPLATE_ROOT}header.htm.in`;
  public FLASH_IN = `${this.TEMPLATE_ROOT}flash.htm.in`;
  public PAGE_IN = `${this.TEMPLATE_ROOT}page1x2.htm.in`;

  // Document title
  private title: string;

  // Document filenames
  private fileNameHTML: string;
  private fileNamePDF: string;

  // HTML string that will be written to file
  private str: string = '';

  constructor(filename: string) {
    this.title = "Flash Cards";
    this.fileNameHTML = `${filename}.htm`;
    this.fileNamePDF = `${filename}.pdf`;


    // Header which includes title and table styling
    this.str = fs.readFileSync(this.HEADER_IN, 'utf-8');
    //this.str += "<h1>" + this.title + "</h1>";
  }

  /**
   * Get the document title
   * @returns Get
   */
  public getDocumentTitle(): string {
    return this.title;
  }

  /**
   * Get the document filename
   */
  public getFilename(): string {
    return this.fileNameHTML;
  }

  /**
  * Convert flashcard to HTML text
  * @param {configType} config - Object of current flashcard
  * @param {imgWidth} number - Image width in pixels
  * @returns string
  */
  public makeFlashcard(config: config.configType, imgWidth: number) : string {
    let flash = this.readTemplate(this.FLASH_IN);

    // Replace variables in template
    flash = flash.replace("${uid}", config.uid.toString());
    flash = flash.replace("${pos}", config.pos.toString());
    flash = flash.replace("${english}", config.english);
    flash = flash.replace("${lwc}", config.lwc);
    flash = flash.replace("${ipa}", config.ipa);

    // `<div class="h-100 d-inline-block" style="width: ${imgWidth}px"></div>`;
    let imgPadding = `<div style="width:${imgWidth} px; height:${imgWidth} px"></div>`;
    let imgString = (config.img) ? `<p><img src="${config.img.path}" class="img-fluid rounded" width="${config.img.x}" height="${config.img.y}"></p>` : imgPadding;
    flash = flash.replace("${imgPath}", imgString);

    return flash;
  }

  /**
   * Append flash card text into the HTML document
   * One after another
   * @param cards Continuous string of flashcard text
   */
  public writeFlashcards(cards : string[]) {
    cards.forEach(c => {
      this.str += c;
    });
  }

  /**
   * Append flash card text into the HTML document
   * 2 columns x 3 rows
   * @param cards Array of flashcard text
   */
  public writeFlashcards2x3(cards: string[]) {
    let originalPage = this.readTemplate(this.PAGE_IN);
    let i=0;
    while(i < cards.length) {
      let page = originalPage;
      page = page.replace("${card0}", cards[i]   ? cards[i] : "");
      page = page.replace("${card1}", cards[i+1] ? cards[i+1] : "");
      page = page.replace("${card2}", cards[i+2] ? cards[i+2] : "");
      page = page.replace("${card3}", cards[i+3] ? cards[i+3] : "");
      page = page.replace("${card4}", cards[i+4] ? cards[i+4] : "");
      page = page.replace("${card5}", cards[i+5] ? cards[i+5] : "");

      this.str += page;
      i+=6;
    }
  }

  /**
   * Append flash card text into the HTML document
   * 1 column x 2 rows
   * @param cards Array of flashcard text
   */
  public writeFlashcards1x2(cards: string[]) {
    let originalPage = this.readTemplate(this.PAGE_IN);
    let i=0;
    while(i < cards.length) {
      let page = originalPage;
      page = page.replace("${card0}", cards[i]   ? cards[i] : "");
      page = page.replace("${card1}", cards[i+1] ? cards[i+1] : "");

      this.str += page;
      i+=2;
    }
  }

  /**
   * Close the body and HTML tags in the document
   */
  public closeDocument() {
    this.str += "</body></html>";
  }

  /**
   * Write the HTML string to HTML file
   */
  public writeHTML() {
    this.closeDocument();
    fs.writeFileSync('./' + this.fileNameHTML, this.str);
    console.info(`Flashcards written to ${this.fileNameHTML}`);
  }

  /**
   * Convert HTML file to PDF
   */
  public async writePDF() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const contentHTML = fs.readFileSync(this.fileNameHTML, 'utf8');
    await page.setContent(contentHTML);
    await page.pdf({
      path: `${this.fileNamePDF}`,
      format: 'A4'
    });
    await browser.close();
  }

  /**
   * Reads the template file and returns a string
   * @param template string
   * @returns string
   */
  private readTemplate(template: string): string {
    if (!fs.existsSync(template)) {
      console.error("Can't open flashcard template file " + template);
      process.exit(1);
    }
    return fs.readFileSync(template, 'utf-8');
  }
}

