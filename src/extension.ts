import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { extractStrings, isUserFacingString, isFieldInitializer } from './stringExtractor';
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

        // Bug 3 Fix: Filter out field initializers (context not available there)
        const localizableStrings = userFacingStrings.filter(s => !isFieldInitializer(text, s.index));

        if (localizableStrings.length !== userFacingStrings.length) {
            const skipped = userFacingStrings.length - localizableStrings.length;
            progress.log(`Skipped ${skipped} field initializers (context not available)`, 'info');
        }

        if (localizableStrings.length === 0) {
            progress.log('No localizable strings found (field initializers excluded).', 'warning');
            progress.complete('No localizable strings found.');
            vscode.window.showInformationMessage('No localizable strings found (field initializers are excluded).');
            return;
        }

        progress.log(`Found ${localizableStrings.length} localizable strings`, 'success');
        progress.updateStatus(`Extracting ${localizableStrings.length} strings...`);

        // Update ARB file
        await updateArbFile(localizableStrings);
        progress.log('Updated app_en.arb with extracted strings', 'success');

        // Update code
        const importStatement = "import 'package:flutter_gen/gen_l10n/app_localizations.dart';";
        const hasImport = text.includes("gen_l10n/app_localizations.dart");
        const stringsToReplace = [...localizableStrings].sort((a, b) => b.index - a.index);

        progress.updateStatus('Updating code...');

        // Track const removals for parent widgets (Bug 2)
        const constRemovalPositions = new Set<number>();

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

                // Bug 1 & 2 Fix: Handle const removal for both direct and parent widgets
                const lookbehindLength = 150; // Increased to catch parent widgets
                const startOffset = Math.max(0, strObj.index - lookbehindLength);
                const rangeBefore = new vscode.Range(
                    document.positionAt(startOffset),
                    document.positionAt(strObj.index)
                );
                const textBefore = document.getText(rangeBefore);

                // Pattern 1: Direct const widget - const Text("...")
                const directConstMatch = textBefore.match(/(const)\s+([A-Z][a-zA-Z]*\s*\()$/);

                // Pattern 2: Parent const widget - const Column(children: [Text("...")
                // Look for const followed by a widget, then children/child with our string
                const parentConstMatch = textBefore.match(/(const)\s+([A-Z][a-zA-Z]*)\s*\([^)]*(?:children|child)\s*:\s*\[?\s*(?:[A-Z][a-zA-Z]*\s*\(\s*)?$/);

                if (directConstMatch && directConstMatch.index !== undefined) {
                    // Bug 1 Fix: Remove const from direct widget like const Text("...")
                    const absStartIndex = startOffset + directConstMatch.index;

                    // Check if we haven't already removed this const
                    if (!constRemovalPositions.has(absStartIndex)) {
                        constRemovalPositions.add(absStartIndex);
                        startPos = document.positionAt(absStartIndex);
                        replacement = `${directConstMatch[2]}${replacement}`;
                        progress.log(`Removed 'const' from widget at line ${document.positionAt(strObj.index).line + 1}`, 'info');
                    }
                } else if (parentConstMatch && parentConstMatch.index !== undefined) {
                    // Bug 2 Fix: Remove const from parent widget like const Column(...)
                    const absStartIndex = startOffset + parentConstMatch.index;

                    if (!constRemovalPositions.has(absStartIndex)) {
                        constRemovalPositions.add(absStartIndex);
                        // Replace the const with just the widget name
                        const parentWidgetName = parentConstMatch[2];
                        const textAfterConst = textBefore.substring(parentConstMatch.index + parentConstMatch[0].length);

                        startPos = document.positionAt(absStartIndex);
                        // Reconstruct: remove "const " from the beginning
                        const withoutConst = textBefore.substring(parentConstMatch.index).replace(/^const\s+/, '');
                        replacement = `${withoutConst}${replacement}`;
                        progress.log(`Removed 'const' from parent widget '${parentWidgetName}' at line ${document.positionAt(absStartIndex).line + 1}`, 'info');
                    }
                }

                editBuilder.replace(new vscode.Range(startPos, endPos), replacement);
            }
        });

        progress.log(`Updated ${stringsToReplace.length} strings in code`, 'success');
        progress.complete(`Extracted ${localizableStrings.length} strings from ${fileName}`);

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
            // Auto-extract feature: Ask user if they want to extract first
            const action = await vscode.window.showWarningMessage(
                "⚠️ No app_en.arb found! Would you like to extract strings first?",
                "Yes, Extract First",
                "Cancel"
            );

            if (action === "Yes, Extract First") {
                // Run extract command first
                await vscode.commands.executeCommand('flutterAutoLocalizer.extract');

                // Check again if ARB was created after extraction
                if (!hasSourceArb()) {
                    vscode.window.showErrorMessage("❌ No strings were extracted. Please open a Dart file with strings and try again.");
                    return;
                }
                vscode.window.showInformationMessage("✅ Strings extracted! Now continuing with translation...");
            } else {
                return;
            }
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
        ).then((action: string | undefined) => {
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
        ).then((action: string | undefined) => {
            if (action === 'Open Instructions') {
                const workspace = getWorkspaceInfo();
                if (workspace) {
                    const mdPath = path.join(workspace.rootPath, 'LOCALIZATION_SETUP.md');
                    if (fs.existsSync(mdPath)) {
                        vscode.workspace.openTextDocument(mdPath).then((doc: vscode.TextDocument) => {
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

    // ============================================================
    // COMMAND 8: AUTO LOCALIZE - Complete one-click workflow
    // ============================================================
    const autoLocalizeCommand = vscode.commands.registerCommand('flutterAutoLocalizer.autoLocalize', async () => {
        const progress = new ProcessingProgress('Auto Localize');
        progress.show();
        progress.log('🚀 Starting Auto Localize workflow...');

        // Step 1: Check workspace
        const workspace = getWorkspaceInfo();
        if (!workspace) {
            progress.log('❌ No workspace folder open!', 'error');
            progress.complete('Failed - No workspace');
            vscode.window.showErrorMessage(
                '❌ No workspace folder open! Please open a Flutter project folder first.',
                'Open Folder'
            ).then((action: string | undefined) => {
                if (action === 'Open Folder') {
                    vscode.commands.executeCommand('vscode.openFolder');
                }
            });
            return;
        }
        progress.log('✓ Workspace found: ' + workspace.rootPath, 'success');

        // Step 2: Check/Generate setup
        progress.updateStatus('Checking l10n setup...');
        if (!hasSourceArb()) {
            progress.log('No l10n setup found, generating...', 'info');
            await generateLocalizationSetup();
            progress.log('✓ Generated l10n setup files', 'success');
        } else {
            progress.log('✓ l10n setup already exists', 'success');
        }

        // Step 3: Ask user for extraction mode
        progress.updateStatus('Waiting for user input...');
        const extractionMode = await vscode.window.showQuickPick(
            [
                {
                    label: '$(folder) Batch All Files',
                    description: 'Process all Dart files in the project at once',
                    value: 'batch'
                },
                {
                    label: '$(files) Page by Page',
                    description: 'Process one file at a time with review',
                    value: 'pageByPage'
                }
            ],
            {
                title: '🚀 Auto Localize - Choose Extraction Mode',
                placeHolder: 'How would you like to extract strings?'
            }
        );

        if (!extractionMode) {
            progress.log('User cancelled extraction mode selection', 'warning');
            progress.complete('Cancelled by user');
            return;
        }

        // Step 4: Run extraction
        progress.updateStatus('Extracting strings...');
        progress.log(`Starting ${extractionMode.value} extraction...`, 'info');

        if (extractionMode.value === 'batch') {
            await batchProcessAllFiles();
        } else {
            await localizePageByPage();
        }

        // Step 5: Check if strings were extracted
        if (!hasSourceArb()) {
            progress.log('❌ No strings were extracted!', 'error');
            progress.complete('Failed - No strings found');
            vscode.window.showWarningMessage(
                '⚠️ No strings were extracted. Make sure your Dart files contain hardcoded strings like Text("Hello").',
                'Show Tips'
            ).then((action: string | undefined) => {
                if (action === 'Show Tips') {
                    vscode.window.showInformationMessage(
                        'Tips: Use Text("string"), title: "string", or label: "string" patterns in your Dart files.'
                    );
                }
            });
            return;
        }
        progress.log('✓ Strings extracted successfully', 'success');

        // Step 6: Ask to translate
        progress.updateStatus('Preparing translation...');
        const translateAction = await vscode.window.showInformationMessage(
            '✅ Strings extracted! Would you like to translate to other languages now?',
            'Yes, Translate',
            'No, Done'
        );

        if (translateAction === 'Yes, Translate') {
            progress.log('Starting translation...', 'info');
            await vscode.commands.executeCommand('flutterAutoLocalizer.translate');
            progress.log('✓ Translation completed', 'success');
        }

        // Step 7: Complete with better next steps
        progress.complete('🎉 Auto Localize completed successfully!');

        // Show comprehensive next steps
        const nextSteps = await vscode.window.showInformationMessage(
            '🎉 Auto Localize completed! What would you like to do next?',
            'Run flutter pub get',
            'Hot Restart App',
            'Open ARB File',
            'Done'
        );

        if (nextSteps === 'Run flutter pub get') {
            const terminal = vscode.window.createTerminal('Flutter L10n');
            terminal.show();
            terminal.sendText('flutter pub get');
            vscode.window.showInformationMessage(
                '💡 Tip: After "flutter pub get", hot restart your app (Shift+R) to see changes!'
            );
        } else if (nextSteps === 'Hot Restart App') {
            vscode.window.showInformationMessage(
                '🔄 Hot Restart: Press Shift+R in your Flutter terminal, or use "flutter run" and press r/R',
                'Run flutter pub get first'
            ).then((action: string | undefined) => {
                if (action === 'Run flutter pub get first') {
                    const terminal = vscode.window.createTerminal('Flutter L10n');
                    terminal.show();
                    terminal.sendText('flutter pub get');
                }
            });
        } else if (nextSteps === 'Open ARB File') {
            const arbPath = path.join(workspace.rootPath, 'lib', 'l10n', 'app_en.arb');
            if (fs.existsSync(arbPath)) {
                const doc = await vscode.workspace.openTextDocument(arbPath);
                await vscode.window.showTextDocument(doc);
            }
        }
    });

    // ============================================================
    // COMMAND 9: ADD LANGUAGE - Add single language translation
    // ============================================================
    const addLanguageCommand = vscode.commands.registerCommand('flutterAutoLocalizer.addLanguage', async () => {
        const progress = new ProcessingProgress('Add Language');
        progress.show();
        progress.log('🌍 Starting Add Language workflow...');

        const workspace = getWorkspaceInfo();
        if (!workspace) {
            progress.log('❌ No workspace folder open!', 'error');
            progress.complete('Failed - No workspace');
            vscode.window.showErrorMessage('❌ No workspace folder open!');
            return;
        }

        const l10nPath = path.join(workspace.rootPath, 'lib', 'l10n');
        const sourceArbPath = path.join(l10nPath, 'app_en.arb');

        if (!fs.existsSync(sourceArbPath)) {
            progress.log('❌ No app_en.arb found!', 'error');
            vscode.window.showErrorMessage('❌ No app_en.arb found! Run "Auto Localize" first.');
            progress.complete('Failed');
            return;
        }

        // Get existing languages
        const existingLangs: string[] = [];
        if (fs.existsSync(l10nPath)) {
            fs.readdirSync(l10nPath).forEach(f => {
                const match = f.match(/app_(\w+)\.arb$/);
                if (match && match[1] !== 'en') {
                    existingLangs.push(match[1]);
                }
            });
        }

        progress.log(`Existing: ${existingLangs.length > 0 ? existingLangs.join(', ') : 'None'}`, 'info');

        const languageCode = await vscode.window.showInputBox({
            title: '🌍 Add New Language',
            prompt: 'Enter language code (e.g., "zh" for Chinese, "ko" for Korean)',
            placeHolder: 'Language code (e.g., zh, ko, ar, hi)',
            validateInput: (value) => {
                if (!value || value.length < 2 || value.length > 5) return 'Enter valid code (2-5 chars)';
                if (existingLangs.includes(value)) return `"${value}" already exists!`;
                if (value === 'en') return 'English is the source';
                return null;
            }
        });

        if (!languageCode) {
            progress.complete('Cancelled');
            return;
        }

        progress.updateStatus(`Translating to ${languageCode}...`);
        try {
            await translateStrings([], [languageCode]);
            progress.complete(`🎉 Added ${languageCode}!`);
            vscode.window.showInformationMessage(
                `🎉 Added ${languageCode}! Run "flutter pub get" to update.`,
                'Run flutter pub get'
            ).then((action: string | undefined) => {
                if (action === 'Run flutter pub get') {
                    const terminal = vscode.window.createTerminal('Flutter');
                    terminal.show();
                    terminal.sendText('flutter pub get');
                }
            });
        } catch (error) {
            progress.complete('Failed');
            vscode.window.showErrorMessage(`❌ Translation failed: ${error}`);
        }
    });

    // ============================================================
    // COMMAND 10: EXTRACT ONLY - Extract without translation
    // ============================================================
    const extractOnlyCommand = vscode.commands.registerCommand('flutterAutoLocalizer.extractOnly', async () => {
        const progress = new ProcessingProgress('Extract Only');
        progress.show();
        progress.log('📝 Extracting strings only (no translation)...');

        const workspace = getWorkspaceInfo();
        if (!workspace) {
            progress.log('❌ No workspace!', 'error');
            progress.complete('Failed');
            vscode.window.showErrorMessage('❌ No workspace folder open!');
            return;
        }

        if (!hasSourceArb()) {
            await generateLocalizationSetup();
        }

        await batchProcessAllFiles();

        progress.complete('🎉 Extraction done!');
        vscode.window.showInformationMessage(
            '🎉 Strings extracted! Use "Add Language" to translate.',
            'Add Language', 'Run flutter pub get'
        ).then((action: string | undefined) => {
            if (action === 'Add Language') {
                vscode.commands.executeCommand('flutterAutoLocalizer.addLanguage');
            } else if (action === 'Run flutter pub get') {
                const terminal = vscode.window.createTerminal('Flutter');
                terminal.show();
                terminal.sendText('flutter pub get');
            }
        });
    });

    // ============================================================
    // COMMAND 11: SYNC TRANSLATIONS - Add missing keys to existing ARBs
    // ============================================================
    const syncTranslationsCommand = vscode.commands.registerCommand('flutterAutoLocalizer.syncTranslations', async () => {
        const progress = new ProcessingProgress('Sync Translations');
        progress.show();
        progress.log('🔄 Syncing translations...');

        const workspace = getWorkspaceInfo();
        if (!workspace) {
            progress.complete('Failed');
            vscode.window.showErrorMessage('❌ No workspace folder open!');
            return;
        }

        const l10nPath = path.join(workspace.rootPath, 'lib', 'l10n');
        const sourceArbPath = path.join(l10nPath, 'app_en.arb');

        if (!fs.existsSync(sourceArbPath)) {
            progress.complete('Failed');
            vscode.window.showErrorMessage('❌ No app_en.arb found!');
            return;
        }

        const sourceArb = JSON.parse(fs.readFileSync(sourceArbPath, 'utf-8'));
        const sourceKeys = Object.keys(sourceArb).filter(k => !k.startsWith('@'));

        const existingLangs: string[] = [];
        fs.readdirSync(l10nPath).forEach(f => {
            const match = f.match(/app_(\w+)\.arb$/);
            if (match && match[1] !== 'en') existingLangs.push(match[1]);
        });

        if (existingLangs.length === 0) {
            progress.complete('No translations');
            vscode.window.showInformationMessage('No translation files. Use "Add Language" first.');
            return;
        }

        // Re-translate all existing languages to sync
        progress.updateStatus('Syncing all languages...');
        await translateStrings([], existingLangs);

        progress.complete('🎉 Synced!');
        vscode.window.showInformationMessage(
            `🎉 Synced ${existingLangs.length} languages!`,
            'Run flutter pub get'
        ).then((action: string | undefined) => {
            if (action === 'Run flutter pub get') {
                const terminal = vscode.window.createTerminal('Flutter');
                terminal.show();
                terminal.sendText('flutter pub get');
            }
        });
    });

    // ============================================================
    // COMMAND 12: VALIDATE LANGUAGES - Check for missing ARB files
    // ============================================================
    const validateLanguagesCommand = vscode.commands.registerCommand('flutterAutoLocalizer.validateLanguages', async () => {
        const progress = new ProcessingProgress('Validate Languages');
        progress.show();
        progress.log('🔍 Validating languages...');

        const workspace = getWorkspaceInfo();
        if (!workspace) {
            progress.complete('Failed');
            vscode.window.showErrorMessage('❌ No workspace folder open!');
            return;
        }

        const l10nPath = path.join(workspace.rootPath, 'lib', 'l10n');

        // Get available ARB files
        const availableLangs: string[] = ['en']; // English is always assumed
        if (fs.existsSync(l10nPath)) {
            fs.readdirSync(l10nPath).forEach(f => {
                const match = f.match(/app_(\w+)\.arb$/);
                if (match) availableLangs.push(match[1]);
            });
        }

        // Remove duplicates
        const uniqueLangs = [...new Set(availableLangs)];
        progress.log(`Available ARB files: ${uniqueLangs.join(', ')}`, 'info');

        // Check main.dart for supported locales
        const mainDartPath = path.join(workspace.rootPath, 'lib', 'main.dart');
        let supportedLocalesInCode: string[] = [];

        if (fs.existsSync(mainDartPath)) {
            const mainContent = fs.readFileSync(mainDartPath, 'utf-8');
            // Look for Locale('xx') patterns
            const localeMatches = mainContent.matchAll(/Locale\s*\(\s*['"](\w{2,5})['"]\s*\)/g);
            for (const match of localeMatches) {
                supportedLocalesInCode.push(match[1]);
            }
        }

        if (supportedLocalesInCode.length > 0) {
            progress.log(`Locales in code: ${supportedLocalesInCode.join(', ')}`, 'info');

            // Check for missing ARB files
            const missingArbs = supportedLocalesInCode.filter(l => !uniqueLangs.includes(l));

            if (missingArbs.length > 0) {
                progress.log(`⚠️ Missing ARB files: ${missingArbs.join(', ')}`, 'warning');
                progress.complete('Issues found!');

                const action = await vscode.window.showWarningMessage(
                    `⚠️ Missing ARB files for: ${missingArbs.join(', ')}. App may crash!`,
                    'Add Missing Languages',
                    'Ignore'
                );

                if (action === 'Add Missing Languages') {
                    for (const lang of missingArbs) {
                        await translateStrings([], [lang]);
                        progress.log(`✓ Added ${lang}`, 'success');
                    }
                    vscode.window.showInformationMessage(`🎉 Added ${missingArbs.length} missing languages!`);
                }
                return;
            }
        }

        progress.log('✓ All languages have corresponding ARB files', 'success');
        progress.complete('✅ Validation passed!');
        vscode.window.showInformationMessage(
            `✅ Languages validated! Available: ${uniqueLangs.join(', ')}`
        );
    });

    // Register all commands
    context.subscriptions.push(
        extractCommand,
        translateCommand,
        pageByPageCommand,
        batchCommand,
        setupCommand,
        statusCommand,
        previewCommand,
        autoLocalizeCommand,
        addLanguageCommand,
        extractOnlyCommand,
        syncTranslationsCommand,
        validateLanguagesCommand
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
