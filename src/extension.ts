import * as vscode from 'vscode';
import { extractStrings } from './stringExtractor';
import { updateArbFile } from './arbManager';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "flutter-auto-localizer" is now active!');

    let disposable = vscode.commands.registerCommand('flutterAutoLocalizer.start', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const text = document.getText();
        const extractedStrings = extractStrings(text);

        console.log('Found strings:', extractedStrings);

        if (extractedStrings.length > 0) {
            await updateArbFile(extractedStrings);
        } else {
            vscode.window.showInformationMessage('No strings found to extract.');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
