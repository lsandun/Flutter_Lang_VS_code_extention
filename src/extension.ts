import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { extractStrings, isUserFacingString } from './stringExtractor';
import { updateArbFile, generateKey } from './arbManager';
import { translateStrings } from './translator';
import { SUPPORTED_LANGUAGES } from './languages';
import { generateLocalizationSetup } from './setupGenerator';
import { batchProcessAllFiles, previewBatchExtraction } from './batchProcessor';

export function activate(context: vscode.ExtensionContext) {
    console.log('Flutter Auto Localizer is now active!');

    // Command 1: Main localization command (existing)
    let startCommand = vscode.commands.registerCommand('flutterAutoLocalizer.start', async () => {
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
                    let startPos = document.positionAt(strObj.index);
                    let endPos = document.positionAt(strObj.index + strObj.fullMatch.length);

                    const key = generateKey(strObj.cleanText);
                    let replacement = `AppLocalizations.of(context)!.${key}`;

                    // IMPROVED: Check for preceding 'const' with various widget types
                    // Handles: const Text(, const Icon(, const Tooltip(, etc.
                    const lookbehindLength = 80; // Increased for better detection
                    const startOffset = Math.max(0, strObj.index - lookbehindLength);
                    const rangeBefore = new vscode.Range(
                        document.positionAt(startOffset),
                        document.positionAt(strObj.index)
                    );
                    const textBefore = document.getText(rangeBefore);

                    // Match 'const WidgetName(' patterns
                    // Supports: Text, Tooltip, InputDecoration, hintText:, labelText:, etc.
                    const constWidgetMatch = textBefore.match(/(const)\s+([A-Z][a-zA-Z]*\s*\()$/);
                    const constNamedParamMatch = textBefore.match(/(const)\s+([A-Z][a-zA-Z]*\s*\([^)]*,?\s*)$/);

                    if (constWidgetMatch && constWidgetMatch.index !== undefined) {
                        // Direct widget: const Text(
                        const absStartIndex = startOffset + constWidgetMatch.index;
                        startPos = document.positionAt(absStartIndex);
                        replacement = `${constWidgetMatch[2]}${replacement}`;
                    } else if (constNamedParamMatch && constNamedParamMatch.index !== undefined) {
                        // Widget with params: const InputDecoration(labelText:
                        const absStartIndex = startOffset + constNamedParamMatch.index;
                        startPos = document.positionAt(absStartIndex);
                        replacement = `${constNamedParamMatch[2]}${replacement}`;
                    } else {
                        // Check for simple 'const' before string in other contexts
                        const simpleConstMatch = textBefore.match(/const\s+$/);
                        if (simpleConstMatch && simpleConstMatch.index !== undefined) {
                            const absStartIndex = startOffset + simpleConstMatch.index;
                            startPos = document.positionAt(absStartIndex);
                            // Just remove const, keep the replacement
                        }
                    }

                    const range = new vscode.Range(startPos, endPos);
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

    context.subscriptions.push(startCommand);

    // Command 2: Generate Flutter localization setup
    let setupCommand = vscode.commands.registerCommand('flutterAutoLocalizer.setup', async () => {
        await generateLocalizationSetup();
    });
    context.subscriptions.push(setupCommand);

    // Command 3: Batch process all Dart files
    let batchCommand = vscode.commands.registerCommand('flutterAutoLocalizer.batchProcess', async () => {
        await batchProcessAllFiles();
    });
    context.subscriptions.push(batchCommand);

    // Command 4: Preview batch extraction
    let previewCommand = vscode.commands.registerCommand('flutterAutoLocalizer.preview', async () => {
        await previewBatchExtraction();
    });
    context.subscriptions.push(previewCommand);

    // Command 5: Quick translate current file only (no language picker)
    let quickTranslateCommand = vscode.commands.registerCommand('flutterAutoLocalizer.quickTranslate', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'dart') {
            vscode.window.showErrorMessage('Please open a Dart file first.');
            return;
        }

        const document = editor.document;
        const text = document.getText();
        const extractedStrings = extractStrings(text);

        if (extractedStrings.length === 0) {
            vscode.window.showInformationMessage('No strings found to extract.');
            return;
        }

        // Filter to only user-facing strings
        const userFacingStrings = extractedStrings.filter(s => isUserFacingString(s.cleanText));

        if (userFacingStrings.length === 0) {
            vscode.window.showInformationMessage('No user-facing strings found.');
            return;
        }

        // Show preview and ask for confirmation
        const proceed = await vscode.window.showQuickPick(
            ['Yes, localize these strings', 'No, cancel'],
            { placeHolder: `Found ${userFacingStrings.length} user-facing strings. Proceed?` }
        );

        if (proceed !== 'Yes, localize these strings') {
            return;
        }

        await updateArbFile(userFacingStrings);

        const importStatement = "import 'package:flutter_gen/gen_l10n/app_localizations.dart';";
        const hasImport = text.includes("gen_l10n/app_localizations.dart");

        const stringsToReplace = [...userFacingStrings].sort((a, b) => b.index - a.index);

        await editor.edit(editBuilder => {
            if (!hasImport) {
                editBuilder.insert(new vscode.Position(0, 0), importStatement + '\n');
            }

            for (const strObj of stringsToReplace) {
                let startPos = document.positionAt(strObj.index);
                let endPos = document.positionAt(strObj.index + strObj.fullMatch.length);

                const key = generateKey(strObj.cleanText);
                let replacement = `AppLocalizations.of(context)!.${key}`;

                const range = new vscode.Range(startPos, endPos);
                editBuilder.replace(range, replacement);
            }
        });

        vscode.window.showInformationMessage(`Extracted ${userFacingStrings.length} strings to ARB.`);
    });
    context.subscriptions.push(quickTranslateCommand);

    // Show welcome message on first activation
    const hasShownWelcome = context.globalState.get('hasShownWelcome');
    if (!hasShownWelcome) {
        vscode.window.showInformationMessage(
            'Flutter Auto Localizer activated! Use Ctrl+Shift+P and search "Flutter Auto Localizer".',
            'Show Commands'
        ).then(selection => {
            if (selection === 'Show Commands') {
                vscode.commands.executeCommand('workbench.action.quickOpen', '>Flutter Auto Localizer');
            }
        });
        context.globalState.update('hasShownWelcome', true);
    }
}

export function deactivate() { }
