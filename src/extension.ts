import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { extractStrings, isUserFacingString } from './stringExtractor';
import { updateArbFile, generateKey } from './arbManager';
import { translateStrings } from './translator';
import { SUPPORTED_LANGUAGES } from './languages';
import { generateLocalizationSetup } from './setupGenerator';
import { batchProcessAllFiles, previewBatchExtraction } from './batchProcessor';
import { localizePageByPage, showLocalizationStatus } from './pageProcessor';

export function activate(context: vscode.ExtensionContext) {
    console.log('Flutter Auto Localizer is now active!');

    // ============================================================
    // COMMAND 1: EXTRACT - Extract strings from current file
    // ============================================================
    const extractCommand = vscode.commands.registerCommand('flutterAutoLocalizer.extract', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'dart') {
            vscode.window.showErrorMessage('Please open a Dart file first.');
            return;
        }

        const document = editor.document;
        const text = document.getText();
        const extractedStrings = extractStrings(text);

        if (extractedStrings.length === 0) {
            vscode.window.showInformationMessage('No strings found to extract in this file.');
            return;
        }

        const userFacingStrings = extractedStrings.filter(s => isUserFacingString(s.cleanText));

        if (userFacingStrings.length === 0) {
            vscode.window.showInformationMessage('No user-facing strings found.');
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

                // Handle const removal
                const lookbehindLength = 80;
                const startOffset = Math.max(0, strObj.index - lookbehindLength);
                const rangeBefore = new vscode.Range(
                    document.positionAt(startOffset),
                    document.positionAt(strObj.index)
                );
                const textBefore = document.getText(rangeBefore);

                const constWidgetMatch = textBefore.match(/(const)\s+([A-Z][a-zA-Z]*\s*\()$/);
                if (constWidgetMatch && constWidgetMatch.index !== undefined) {
                    const absStartIndex = startOffset + constWidgetMatch.index;
                    startPos = document.positionAt(absStartIndex);
                    replacement = `${constWidgetMatch[2]}${replacement}`;
                }

                editBuilder.replace(new vscode.Range(startPos, endPos), replacement);
            }
        });

        const nextAction = await vscode.window.showInformationMessage(
            `Extracted ${userFacingStrings.length} strings!`,
            'Translate Now',
            'Done'
        );

        if (nextAction === 'Translate Now') {
            await vscode.commands.executeCommand('flutterAutoLocalizer.translate');
        }
    });

    // ============================================================
    // COMMAND 2: TRANSLATE - Translate ARB to selected languages
    // ============================================================
    const translateCommand = vscode.commands.registerCommand('flutterAutoLocalizer.translate', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace open.');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const appEnPath = path.join(rootPath, 'lib', 'l10n', 'app_en.arb');

        if (!fs.existsSync(appEnPath)) {
            vscode.window.showErrorMessage("No app_en.arb found! Run 'Extract' first to create ARB file.");
            return;
        }

        // Smart pre-selection of existing languages
        let quickPickItems = SUPPORTED_LANGUAGES.map(lang => ({ ...lang, picked: false }));
        const l10nDir = path.join(rootPath, 'lib', 'l10n');

        if (fs.existsSync(l10nDir)) {
            const files = fs.readdirSync(l10nDir);
            const activeCodes = new Set<string>();

            files.forEach((file: string) => {
                const match = file.match(/^app_([a-zA-Z-]+)\.arb$/);
                if (match) activeCodes.add(match[1]);
            });

            quickPickItems = quickPickItems
                .map(lang => ({ ...lang, picked: activeCodes.has(lang.description!) }))
                .sort((a, b) => (a.picked === b.picked ? 0 : a.picked ? -1 : 1));
        }

        const selectedLanguages = await vscode.window.showQuickPick(quickPickItems, {
            canPickMany: true,
            placeHolder: 'Select target languages for translation'
        });

        if (!selectedLanguages || selectedLanguages.length === 0) {
            return;
        }

        const targetLocales = selectedLanguages.map(l => l.description!);

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Translating...",
            cancellable: false
        }, async (progress) => {
            await translateStrings([], targetLocales, progress);
        });
    });

    // ============================================================
    // COMMAND 3: PAGE BY PAGE - Localize one page at a time
    // ============================================================
    const pageByPageCommand = vscode.commands.registerCommand('flutterAutoLocalizer.pageByPage', async () => {
        await localizePageByPage();
    });

    // ============================================================
    // COMMAND 4: BATCH - Process all files at once
    // ============================================================
    const batchCommand = vscode.commands.registerCommand('flutterAutoLocalizer.batch', async () => {
        await batchProcessAllFiles();
    });

    // ============================================================
    // COMMAND 5: SETUP - Generate all localization setup files
    // ============================================================
    const setupCommand = vscode.commands.registerCommand('flutterAutoLocalizer.setup', async () => {
        await generateLocalizationSetup();
    });

    // ============================================================
    // COMMAND 6: STATUS - Show localization progress
    // ============================================================
    const statusCommand = vscode.commands.registerCommand('flutterAutoLocalizer.status', async () => {
        await showLocalizationStatus();
    });

    // ============================================================
    // COMMAND 7: PREVIEW - Preview extractable strings
    // ============================================================
    const previewCommand = vscode.commands.registerCommand('flutterAutoLocalizer.preview', async () => {
        await previewBatchExtraction();
    });

    // Register all commands
    context.subscriptions.push(
        extractCommand,
        translateCommand,
        pageByPageCommand,
        batchCommand,
        setupCommand,
        statusCommand,
        previewCommand
    );

    // Show welcome message on first activation
    const hasShownWelcome = context.globalState.get('hasShownWelcome');
    if (!hasShownWelcome) {
        vscode.window.showInformationMessage(
            'Flutter Auto Localizer ready! Press Ctrl+Shift+L to start.',
            'Show All Commands'
        ).then((selection: string | undefined) => {
            if (selection === 'Show All Commands') {
                vscode.commands.executeCommand('workbench.action.quickOpen', '>Flutter Auto Localizer');
            }
        });
        context.globalState.update('hasShownWelcome', true);
    }
}

export function deactivate() { }
