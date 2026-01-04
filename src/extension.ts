import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { extractStrings } from './stringExtractor';
import { updateArbFile, generateKey } from './arbManager';
import { translateStrings } from './translator';
import { SUPPORTED_LANGUAGES } from './languages';

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
            const stringsToReplace = [...extractedStrings].sort((a, b) => b.index - a.index);

            await editor.edit(editBuilder => {
                // FIRST: If !hasImport, execute editBuilder.insert(new vscode.Position(0, 0), importStatement + '\n');
                if (!hasImport) {
                    editBuilder.insert(new vscode.Position(0, 0), importStatement + '\n');
                }

                // SECOND: Loop through the extracted strings (in reverse order) and perform the replacements.
                for (const strObj of stringsToReplace) {
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
            // Check if app_en.arb exists BEFORE proceeding
            if (vscode.workspace.workspaceFolders) {
                const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
                const appEnPath = path.join(rootPath, 'lib', 'l10n', 'app_en.arb');

                if (!fs.existsSync(appEnPath)) {
                    vscode.window.showErrorMessage("Critical Error: Source file 'app_en.arb' is missing! Please restore it to sync translations.");
                    return;
                }
            }

            vscode.window.showInformationMessage('No new strings found to extract. Proceeding to translation sync...');
        }

        // Smart Pre-selection Logic
        let quickPickItems = SUPPORTED_LANGUAGES.map(lang => ({ ...lang, picked: false })); // Clone

        if (vscode.workspace.workspaceFolders) {
            const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            const l10nDir = path.join(rootPath, 'lib', 'l10n');

            if (fs.existsSync(l10nDir)) {
                const files = fs.readdirSync(l10nDir);
                const activeCodes = new Set<string>();

                files.forEach(file => {
                    // Match app_{code}.arb, handling regional codes like zh-cn if needed (though filename usually zh_CN)
                    // Our generator uses code directly from supported list which matches google translate codes
                    const match = file.match(/^app_([a-zA-Z-]+)\.arb$/);
                    if (match) {
                        activeCodes.add(match[1]);
                    }
                });

                // Update picked status and Sort
                quickPickItems = quickPickItems.map(lang => {
                    if (activeCodes.has(lang.description)) {
                        return { ...lang, picked: true };
                    }
                    return lang;
                }).sort((a, b) => {
                    // Picked items come first
                    if (a.picked && !b.picked) return -1;
                    if (!a.picked && b.picked) return 1;
                    return 0;
                });
            }
        }

        const selectedLanguages = await vscode.window.showQuickPick(quickPickItems, {
            canPickMany: true,
            placeHolder: 'Select target languages for translation (optional)'
        });

        if (selectedLanguages && selectedLanguages.length > 0) {
            const targetLocales = selectedLanguages.map(l => l.description!);

            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Flutter Auto Localizer",
                cancellable: false
            }, async (progress) => {
                await translateStrings(extractedStrings, targetLocales, progress);
            });

        } else {
            vscode.window.showInformationMessage(`Process completed! (No translation selected)`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
