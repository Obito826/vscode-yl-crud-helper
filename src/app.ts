import {
  CancellationToken,workspace, CompletionItemProvider, ProviderResult,
  TextDocument, Position, CompletionItem, CompletionList, CompletionItemKind,
  SnippetString, Range
} from 'vscode';
import * as kebabCaseATTRS from 'element-helper-json-new/element-attributes.json';
import attrs from './attributes';
import tags from './tags';
const prettyHTML = require('pretty');
export interface TagObject{
  text: string,
  offset: number
};

const TAGS = tags;
const ATTRS = attrs;
// for (const key in kebabCaseATTRS) {
//   if (kebabCaseATTRS.hasOwnProperty(key)) {
//      // @ts-ignore
//     const element = kebabCaseATTRS[key];
//      // @ts-ignore
//     ATTRS[key] = element;
//     const tagAttrs = key.split('/');
//     const hasTag = tagAttrs.length > 1;
//     let tag = '';
//     let attr = '';
//     if (hasTag) {
//       tag = toUpperCase(tagAttrs[0]) + '/';
//       attr = tagAttrs[1];
//        // @ts-ignore
//       ATTRS[tag + attr] = JSON.parse(JSON.stringify(element));
//     }
//   }
// }

// function toUpperCase(key: string): string {
//   let camelCase = key.replace(/\-(\w)/g, function (all, letter) {
//     return letter.toUpperCase();
//   });
//   camelCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
//   return camelCase;
// }

export class ElementCompletionItemProvider implements CompletionItemProvider {
   // @ts-ignore
  private _document: TextDocument;
   // @ts-ignore
  private _position: Position;
  private tagReg: RegExp = /<([\w-]+)\s*/g;
  private attrReg: RegExp = /(?:\(|\s*)(\w+)=['"][^'"]*/;
  private tagStartReg: RegExp = /<([\w-]*)$/;
   // @ts-ignore
  private quotes: string;

  getPreTag(): TagObject | undefined {

    let line = this._position.line;
    let tag: TagObject | string;
    let txt = this.getTextBeforePosition(this._position);

    while (this._position.line - line < 10 && line >= 0) {
      if (line !== this._position.line) {
        txt = this._document.lineAt(line).text;
      }
      tag = this.matchTag(this.tagReg, txt, line);

      if (tag === 'break') { return; }
      if (tag) { return <TagObject>tag; }
      line--;
    }
    return;
  }

  getPreAttr(): string | undefined {
    let txt = this.getTextBeforePosition(this._position).replace(/"[^'"]*(\s*)[^'"]*$/, '');
    let end = this._position.character;
    let start = txt.lastIndexOf(' ', end) + 1;
    let parsedTxt = this._document.getText(new Range(this._position.line, start, this._position.line, end));

    return this.matchAttr(this.attrReg, parsedTxt);
  }

  matchAttr(reg: RegExp, txt: string): string {
    let match = <RegExpExecArray>reg.exec(txt);
    // match ;
    const result = <string>(!/"[^"]*"/.test(txt) && match && match[1]);
    return result;
  }

  matchTag(reg: RegExp, txt: string, line: number): TagObject | string {
    let match: RegExpExecArray;
    let arr: TagObject[] = [];

    if (/<\/?[-\w]+[^<>]*>[\s\w]*<?\s*[\w-]*$/.test(txt) || (this._position.line === line && (/^\s*[^<]+\s*>[^<\/>]*$/.test(txt) || /[^<>]*<$/.test(txt[txt.length - 1])))) {
      return 'break';
    }
    while ((match = <RegExpExecArray>reg.exec(txt))) {
      arr.push({
        text: match[1],
        offset: this._document.offsetAt(new Position(line, match.index))
      });
    }
    return <TagObject | string>arr.pop();
  }

  getTextBeforePosition(position: Position): string {
    var start = new Position(position.line, 0);
    var range = new Range(start, position);
    return this._document.getText(range);
  }

  getAttrValueSuggestion(tag: string, attr: string): CompletionItem[] {
    let suggestions: CompletionItem[] = [];
    const values = this.getAttrValues(tag, attr);
    values.forEach((value: string) => {
      suggestions.push({
        label: value,
        kind: CompletionItemKind.Value
      });
    });
    return suggestions;
  }

  getAttrSuggestion(tag: string) {
    let suggestions: CompletionItem[] = [];
    let tagAttrs = this.getTagAttrs(tag);
    let preText = this.getTextBeforePosition(this._position);
    let prefix = preText.replace(/['"]([^'"]*)['"]$/, '').split(/\s|\(+/).pop();
    // method attribute
    const method = (<string>prefix)[0] === '@';
    // bind attribute
    const bind = (<string>prefix)[0] === ':';

    prefix = (<string>prefix).replace(/[:@]/, '');

    if (/[^@:a-zA-z\s]/.test(prefix[0])) {
      return suggestions;
    }

    (<string[]>tagAttrs).forEach(attr => {
      const attrItem = this.getAttrItem(tag, attr);
      if (attrItem && (!(<string>prefix).trim() || this.firstCharsEqual(attr, (<string>prefix)))) {
        const sug = this.buildAttrSuggestion({ attr, tag, bind, method }, attrItem);
        sug && suggestions.push(sug);
      }
    });
    for (let attr in ATTRS) {
      const attrItem = this.getAttrItem(tag, attr);
      if (attrItem && attrItem.global && (!prefix.trim() || this.firstCharsEqual(attr, prefix))) {
        const sug = this.buildAttrSuggestion({ attr, tag: '', bind, method }, attrItem);
        sug && suggestions.push(sug);
      }
    }
    return suggestions;
  }

  buildAttrSuggestion({ attr = '', tag = '', bind = false, method = false }, { description = '', type = '', version = '' }) {
    if ((method && type === "method") || (bind && type !== "method") || (!method && !bind)) {
      return {
        label: attr,
        insertText: (type && (type === 'flag')) ? `${attr} ` : new SnippetString(`${attr}=${this.quotes}$1${this.quotes}$0`),
        kind: (type && (type === 'method')) ? CompletionItemKind.Method : CompletionItemKind.Property,
        detail: tag ? `<${tag}> ${version ? `(version: ${version})` : ''}` : `element-ui ${version ? `(version: ${version})` : ''}`,
        documentation: description
      };
    } else { return; }
  }

  getAttrValues(tag = '', attr = '') {
    let attrItem = this.getAttrItem(tag, attr);
    let options = attrItem && attrItem.options;
    if (!options && attrItem) {
      if (attrItem.type === 'boolean') {
        options = ['true', 'false'];
      }
    }
    return options || [];
  }

  getTagAttrs(tag: string) {
    // @ts-ignore

  return  (TAGS[tag] && TAGS[tag].attributes) || [];
      // return ["abc","def"];
  }

  getAttrItem(tag: string | undefined, attr: string | undefined) {
    // @ts-ignore
    return ATTRS[`${tag}/${attr}`] || ATTRS[attr]; 
  }

  isAttrValueStart(tag: Object | string | undefined, attr: string) {
    return tag && attr;
  }

  isAttrStart(tag: TagObject | undefined) {
    return tag;
  }

  isTagStart() {
    let txt = this.getTextBeforePosition(this._position);
    return this.tagStartReg.test(txt);
  }

  firstCharsEqual(str1: string, str2: string) {
    if (str2 && str1) {
      return str1[0].toLowerCase() === str2[0].toLowerCase();
    }
    return false;
  }
  // tentative plan for vue file
  notInTemplate(): boolean {
    let line = this._position.line;
    while (line) {
      if (/^\s*<script.*>\s*$/.test(<string>this._document.lineAt(line).text)) {
        return true;
      }
      line--;
    }
    return false;
  }

  provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<CompletionItem[] | CompletionList> {
    this._document = document;
    this._position = position;

    const config = workspace.getConfiguration('element-helper');
    const normalQuotes = config.get('quotes') === 'double' ? '"' : "'";
    this.quotes =normalQuotes;

    let tag: TagObject | string | undefined = this.getPreTag();
    let attr = this.getPreAttr();
    if (this.isAttrValueStart(tag, <string>attr)) {
      return this.getAttrValueSuggestion((<TagObject>tag).text, <string>attr);
    } else if (this.isAttrStart(tag)) {
      return this.getAttrSuggestion((<TagObject>tag).text);
    }
    else if (this.isTagStart()) {
      switch (document.languageId) {
        case 'vue':
          return this.notInTemplate() ? [] : this.getTagSuggestion();
        
      }
    }
    else { return []; }
  }
  getTagSuggestion() {
    let suggestions = [];

    let id = 100;
    for (let tag in TAGS) {
      // @ts-ignore
      suggestions.push(this.buildTagSuggestion(tag, TAGS[tag], id));
      id++;
    }
    return suggestions;
  }
  buildTagSuggestion(tag: string, tagVal: {defaults?: string[],attributes: string[],description:string}, id: Number) {
    const snippets:Array<any> = [];
    let index = 0;
    let that = this;
    function build(tag = '', { defaults = [] }, snippets = []) {
      
      let attrs = '';
      defaults && defaults.forEach((item, i) => {
        attrs += ` ${item}=${that.quotes}$${index + i + 1}${that.quotes}`;
      });
      // @ts-ignore
      snippets.push(`${index > 0 ? '<':''}${tag}${attrs}>`);
      index++;
      // @ts-ignore
      snippets.push(`</${tag}>`);
    };
    // @ts-ignore
    build(tag, tagVal, snippets);

    return {
      label: tag,
      sortText: `0${id}${tag}`,
      insertText: new SnippetString(prettyHTML(snippets.join(''))),
      kind: CompletionItemKind.Snippet,
      documentation: tagVal.description
    };
  }
}