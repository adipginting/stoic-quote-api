import { Injectable } from '@nestjs/common';
import { convert } from 'html-to-text';
import * as fs from 'fs';

@Injectable()
export class AppService {
  private quoteAndInfo(quote: string, philosopher: string, author: string, book: string, chapter?: string): string {
    if (quote.length > 100 && quote !== "" && quote !== undefined) {
      if (chapter === undefined) {
        return "\"" + quote + ".\"" + " --" + `${author}, ${book}`;
      }
      return "\"" + quote + ".\"" + " --" + `${author}, ${book}, ${chapter}`;
    } else {
      return this.processQuote(philosopher);
    }
  }

  private convertTextToQuote(html: string): string {
    let text: string = convert(html, { wordwrap: false });
    text = text.replace(/\[.*?\]/g, "");
    text = text.replace(/[0-9]/g, "");
    text = text.replace("\n", "");
    const textArray: Array<string> = text.split('.');
    const randomQuoteNumber: number = Math.floor(Math.random() * textArray.length);
    let quote: string = textArray[randomQuoteNumber];
    quote = quote.replace(/^\s*/, "");
    return quote;
  }

  private processQuote(philosopher: string): string {

    let randomBookNumber: number = 0;
    let html: string = "";
    let quote: string = "";
    switch (philosopher) {
      case "aurelius":
        randomBookNumber = Math.floor(Math.random() * 12);
        if (randomBookNumber === 0) {
          randomBookNumber = 1;
        }
        html = fs.readFileSync(`marcus-aurelius_meditations_george-long/src/epub/text/book-${randomBookNumber}.xhtml`, 'utf8');
        quote = this.convertTextToQuote(html);
        return this.quoteAndInfo(quote, philosopher, "Marcus Aurelius", "Meditations", `Book ${randomBookNumber}`);
      case "seneca":
        const dir: string = 'seneca_dialogues_aubrey-stewart/src/epub/text';
        const files: Array<string> = fs.readdirSync(dir);
        let bookFiles: Array<string> = [];

        for (let i: number = 0; i < files.length; i++) {
          if (files[i].includes('on-') || files[i].includes('to-'))
            bookFiles.push(files[i]);
        }

        randomBookNumber = Math.floor(Math.random() * bookFiles.length);
        html = fs.readFileSync(dir + "/" + `${bookFiles[randomBookNumber]}`, 'utf8');
        quote = this.convertTextToQuote(html);
        let chapter: string = `${bookFiles[randomBookNumber]}`.replace(/[-]/g, " ");
        chapter = chapter.replace(/.xhtml/, ""); //remove file extension from chapter name
        const chapterArray: Array<string> = chapter.split(" ");
        chapter = chapterArray.reduce((chapterWords: string, chapterWord: string) => { return chapterWords[0].toUpperCase() + chapterWords.slice(1) + " " + chapterWord[0].toUpperCase() + chapterWord.slice(1); }) //capitalize chapter name
        return this.quoteAndInfo(quote, philosopher, "Lucius Anneus Seneca", "Dialogues", `${chapter}`)
      case "epictetus-theechiridion":
        html = fs.readFileSync('epictetus_the-enchiridion_elizabeth-carter/src/epub/text/the-enchiridion.xhtml', 'utf8');
        quote = this.convertTextToQuote(html);
        return this.quoteAndInfo(quote, philosopher, "Epictetus", "The Enchiridion");
    }
  }

  getAureliusQuote(): string {
    return this.processQuote('aurelius');
  }

  getSenecaQuote(): string {
    return this.processQuote('seneca');
  }

  getEpictetusTheEnchridionQuote(): string {
    return this.processQuote('epictetus-theechiridion')
  }

}
