import * as vscode from 'vscode';
import { extractStrings } from './stringExtractor';
import { updateArbFile, generateKey } from './arbManager';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "flutter-auto-localizer" is now active!');

    let disposable = vscode.commands.registerCommand('flutterAutoLocalizer.start', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found');
            return;
        }

        if (editor.document.languageId !== 'dart') {
            vscode.window.showErrorMessage('Flutter Auto Localizer: Please run this command on a Dart file.');
            return;
        }

        const document = editor.document;
        const text = document.getText();
        const extractedStrings = extractStrings(text);

        const importStatement = "import 'package:flutter_gen/gen_l10n/app_localizations.dart';";
        const hasImport = text.includes("gen_l10n/app_localizations.dart");
        console.log("Has Import:", hasImport);

        console.log('Found strings:', extractedStrings);

        if (extractedStrings.length > 0) {
            await updateArbFile(extractedStrings);

            // Sort in reverse order to avoid index drift
            extractedStrings.sort((a, b) => b.index - a.index);

            await editor.edit(editBuilder => {
                // FIRST: If !hasImport, execute editBuilder.insert(new vscode.Position(0, 0), importStatement + '\n');
                if (!hasImport) {
                    editBuilder.insert(new vscode.Position(0, 0), importStatement + '\n');
                }

                // SECOND: Loop through the extracted strings (in reverse order) and perform the replacements.
                for (const strObj of extractedStrings) {
                    const startPos = document.positionAt(strObj.index);
                    const endPos = document.positionAt(strObj.index + strObj.text.length);
                    const range = new vscode.Range(startPos, endPos);

                    const key = generateKey(strObj.text);
                    // Use standard Flutter Gen l10n syntax
                    const replacement = `AppLocalizations.of(context)!.${key}`;

                    editBuilder.replace(range, replacement);
                }
            });

            vscode.window.showInformationMessage(`Localized ${extractedStrings.length} strings successfully!`);
        } else {
            vscode.window.showInformationMessage('No strings found to extract.');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
