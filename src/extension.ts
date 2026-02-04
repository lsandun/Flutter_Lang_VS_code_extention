import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { extractStrings, isUserFacingString } from './stringExtractor';
import { updateArbFile, generateKey } from './arbManager';
import { translateStrings } from './translator';
import { generateLocalizationSetup } from './setupGenerator';
import { batchProcessAllFiles, previewBatchExtraction } from './batchProcessor';
import { localizePageByPage, showLocalizationStatus } from './pageProcessor';
import { showLanguagePicker, ProcessingProgress, showChangesSummary, hasSourceArb, getWorkspaceInfo } from './uiUtils';

export function activate(context: vscode.ExtensionContext) {
    console.log('Flutter Auto Localizer is now active!');

    // ============================================================
    // COMMAND 1: EXTRACT - Extract strings from current file
    // ============================================================
    const extractCommand = vscode.commands.registerCommand('flutterAutoLocalizer.extract', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'dart') {
            vscode.window.showErrorMessage('❌ Please open a Dart file first.');
            return;
        }

        const progress = new ProcessingProgress('Extract');
        progress.show();
        progress.log('Starting string extraction...');
        progress.updateStatus('Scanning file...');

        const document = editor.document;
        const text = document.getText();
        const fileName = path.basename(document.fileName);

        progress.log(`Analyzing: ${fileName}`);

        const extractedStrings = extractStrings(text);

        if (extractedStrings.length === 0) {
            progress.log('No strings found in this file.', 'warning');
            progress.complete('No strings to extract.');
            vscode.window.showInformationMessage('No strings found to extract in this file.');
            return;
        }

        const userFacingStrings = extractedStrings.filter(s => isUserFacingString(s.cleanText));

        if (userFacingStrings.length === 0) {
            progress.log('No user-facing strings found (only technical strings).', 'warning');
            progress.complete('No user-facing strings found.');
            vscode.window.showInformationMessage('No user-facing strings found.');
            return;
        }

        progress.log(`Found ${userFacingStrings.length} user-facing strings`, 'success');
        progress.updateStatus(`Extracting ${userFacingStrings.length} strings...`);

        // Update ARB file
        await updateArbFile(userFacingStrings);
        progress.log('Updated app_en.arb with extracted strings', 'success');

        // Update code
        const importStatement = "import 'package:flutter_gen/gen_l10n/app_localizations.dart';";
        const hasImport = text.includes("gen_l10n/app_localizations.dart");
        const stringsToReplace = [...userFacingStrings].sort((a, b) => b.index - a.index);

        progress.updateStatus('Updating code...');

        await editor.edit(editBuilder => {
            if (!hasImport) {
                editBuilder.insert(new vscode.Position(0, 0), importStatement + '\n');
                progress.log('Added localization import', 'info');
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
                    progress.log(`Removed 'const' at line ${document.positionAt(strObj.index).line + 1}`, 'info');
                }

                editBuilder.replace(new vscode.Range(startPos, endPos), replacement);
            }
        });

        progress.log(`Updated ${stringsToReplace.length} strings in code`, 'success');
        progress.complete(`Extracted ${userFacingStrings.length} strings from ${fileName}`);

        // Ask to translate
        const action = await vscode.window.showInformationMessage(
            `✅ Extracted ${userFacingStrings.length} strings! Translate to other languages?`,
            'Yes, Translate Now',
            'Later'
        );

        if (action === 'Yes, Translate Now') {
            await vscode.commands.executeCommand('flutterAutoLocalizer.translate');
        }
    });

    // ============================================================
    // COMMAND 2: TRANSLATE - Translate ARB to selected languages
    // ============================================================
    const translateCommand = vscode.commands.registerCommand('flutterAutoLocalizer.translate', async () => {
        if (!hasSourceArb()) {
            vscode.window.showErrorMessage("❌ No app_en.arb found! Run 'Extract' first to create the source file.");
            return;
        }

        // Show enhanced language picker
        const selectedLanguages = await showLanguagePicker({
            title: '🌍 Select Target Languages',
            placeholder: 'Search languages... (existing translations shown at top with ✓)'
        });

        if (!selectedLanguages || selectedLanguages.length === 0) {
            vscode.window.showInformationMessage('No languages selected.');
            return;
        }

        const progress = new ProcessingProgress('Translate');
        progress.show();
        progress.log('Starting translation process...');
        progress.log(`Target languages: ${selectedLanguages.join(', ')}`);

        const workspace = getWorkspaceInfo()!;
        const arbFilesCreated: string[] = [];
        const arbFilesUpdated: string[] = [];

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "🌍 Translating...",
            cancellable: true
        }, async (vscodeProgress, token) => {
            const totalLangs = selectedLanguages.length;
            let completed = 0;

            for (const lang of selectedLanguages) {
                if (token.isCancellationRequested) {
                    progress.log('Translation cancelled by user', 'warning');
                    break;
                }

                const arbPath = path.join(workspace.l10nDir, `app_${lang}.arb`);
                const isNew = !fs.existsSync(arbPath);

                progress.updateStatus(`Translating to ${lang}...`);
                progress.log(`Processing: ${lang} (${isNew ? 'new' : 'update'})`);

                vscodeProgress.report({
                    message: `${lang} (${completed + 1}/${totalLangs})`,
                    increment: (1 / totalLangs) * 100
                });

                try {
                    await translateStrings([], [lang], {
                        report: (value: { message?: string }) => {
                            if (value.message) {
                                progress.log(`  ${value.message}`, 'info');
                            }
                        }
                    });

                    if (isNew) {
                        arbFilesCreated.push(`app_${lang}.arb`);
                    } else {
                        arbFilesUpdated.push(`app_${lang}.arb`);
                    }

                    progress.log(`✓ Completed: ${lang}`, 'success');
                } catch (error) {
                    progress.log(`✗ Failed: ${lang} - ${error}`, 'error');
                }

                completed++;
            }
        });

        progress.complete(`Translated to ${selectedLanguages.length} languages`);

        // Show summary
        await showChangesSummary({
            filesModified: [],
            stringsExtracted: 0,
            languagesTranslated: selectedLanguages,
            arbFilesCreated,
            arbFilesUpdated
        });

        vscode.window.showInformationMessage(
            `✅ Translation complete! ${arbFilesCreated.length} new, ${arbFilesUpdated.length} updated.`,
            'Show Files'
        ).then(action => {
            if (action === 'Show Files') {
                const l10nUri = vscode.Uri.file(workspace.l10nDir);
                vscode.commands.executeCommand('revealInExplorer', l10nUri);
            }
        });
    });

    // ============================================================
    // COMMAND 3: PAGE BY PAGE - Localize one page at a time
    // ============================================================
    const pageByPageCommand = vscode.commands.registerCommand('flutterAutoLocalizer.pageByPage', async () => {
        await localizePageByPageWithTranslation();
    });

    // ============================================================
    // COMMAND 4: BATCH - Process all files at once
    // ============================================================
    const batchCommand = vscode.commands.registerCommand('flutterAutoLocalizer.batch', async () => {
        await batchProcessWithTranslation();
    });

    // ============================================================
    // COMMAND 5: SETUP - Generate all localization setup files
    // ============================================================
    const setupCommand = vscode.commands.registerCommand('flutterAutoLocalizer.setup', async () => {
        const progress = new ProcessingProgress('Setup');
        progress.show();
        progress.log('Generating localization setup files...');

        await generateLocalizationSetup();

        progress.complete('Setup files generated successfully!');

        vscode.window.showInformationMessage(
            '✅ Setup complete! Check LOCALIZATION_SETUP.md for instructions.',
            'Open Instructions'
        ).then(action => {
            if (action === 'Open Instructions') {
                const workspace = getWorkspaceInfo();
                if (workspace) {
                    const mdPath = path.join(workspace.rootPath, 'LOCALIZATION_SETUP.md');
                    if (fs.existsSync(mdPath)) {
                        vscode.workspace.openTextDocument(mdPath).then(doc => {
                            vscode.window.showTextDocument(doc);
                        });
                    }
                }
            }
        });
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
            '🚀 Flutter Auto Localizer ready! Press Ctrl+Shift+L to start.',
            'Show All Commands'
        ).then((selection: string | undefined) => {
            if (selection === 'Show All Commands') {
                vscode.commands.executeCommand('workbench.action.quickOpen', '>Flutter L10n');
            }
        });
        context.globalState.update('hasShownWelcome', true);
    }
}

/**
 * Page by Page with Translation option
 */
async function localizePageByPageWithTranslation(): Promise<void> {
    const progress = new ProcessingProgress('Page by Page');
    progress.show();
    progress.log('Starting page-by-page localization...');

    // Run the page by page localization
    await localizePageByPage();

    // Check if there are ARB files now
    if (!hasSourceArb()) {
        progress.log('No strings extracted yet.', 'info');
        progress.complete('Page by Page completed.');
        return;
    }

    // Ask to translate
    const action = await vscode.window.showInformationMessage(
        '📄 Page localized! Would you like to translate to other languages?',
        'Yes, Select Languages',
        'No, Continue'
    );

    if (action === 'Yes, Select Languages') {
        progress.log('User selected to translate...', 'info');
        await vscode.commands.executeCommand('flutterAutoLocalizer.translate');
    }

    progress.complete('Page by Page completed.');
}

/**
 * Batch processing with Translation option
 */
async function batchProcessWithTranslation(): Promise<void> {
    const progress = new ProcessingProgress('Batch Process');
    progress.show();
    progress.log('Starting batch processing...');

    // First, run batch extraction
    await batchProcessAllFiles();

    // Check if there are ARB files now
    if (!hasSourceArb()) {
        progress.log('No strings extracted.', 'warning');
        progress.complete('Batch process completed (no strings found).');
        return;
    }

    progress.log('String extraction completed.', 'success');

    // Ask to translate
    const action = await vscode.window.showInformationMessage(
        '📦 Batch extraction complete! Would you like to translate to other languages?',
        'Yes, Select Languages',
        'No, Done'
    );

    if (action === 'Yes, Select Languages') {
        progress.log('User selected to translate...', 'info');
        await vscode.commands.executeCommand('flutterAutoLocalizer.translate');
    }

    progress.complete('Batch process completed.');
}

export function deactivate() { }
