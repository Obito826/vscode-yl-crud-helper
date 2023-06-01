import * as vscode from 'vscode';

import { ElementCompletionItemProvider } from './app';

export function activate(context: vscode.ExtensionContext) {
  let completionItemProvider = new ElementCompletionItemProvider();
  let completion = vscode.languages.registerCompletionItemProvider([{
    language: 'pug', scheme: 'file'
  }, {
    language: 'jade', scheme: 'file'
  }, {
    language: 'vue', scheme: 'file'
  }, {
    language: 'html', scheme: 'file'
  }], completionItemProvider, '', ' ', ':', '<', '"', "'", '/', '@', '(');
  let vueLanguageConfig = vscode.languages.setLanguageConfiguration('vue', { wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/gi });

  context.subscriptions.push(completion, vueLanguageConfig);
}
