"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const stringExtractor_1 = require("./stringExtractor");
const arbManager_1 = require("./arbManager");
function activate(context) {
    console.log('Congratulations, your extension "flutter-auto-localizer" is now active!');
    let disposable = vscode.commands.registerCommand('flutterAutoLocalizer.start', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found');
            return;
        }
        const document = editor.document;
        const text = document.getText();
        const extractedStrings = (0, stringExtractor_1.extractStrings)(text);
        console.log('Found strings:', extractedStrings);
        if (extractedStrings.length > 0) {
            await (0, arbManager_1.updateArbFile)(extractedStrings);
        }
        else {
            vscode.window.showInformationMessage('No strings found to extract.');
        }
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map