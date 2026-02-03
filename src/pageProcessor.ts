import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { extractStrings, isUserFacingString, ExtractedString } from './stringExtractor';
import { updateArbFile, generateKey } from './arbManager';

/**
 * Page-by-Page Localization Processor
 * Allows developers to localize one page at a time with preview and error handling
 */

interface PageInfo {
    fileName: string;
    filePath: string;
    relativePath: string;
    strings: ExtractedString[];
    stringCount: number;
}

/**
 * Show all pages with extractable strings and let user choose
 */
export async function localizePageByPage(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace open.');
        return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const libPath = path.join(rootPath, 'lib');

    if (!fs.existsSync(libPath)) {
        vscode.window.showErrorMessage('lib/ folder not found. Is this a Flutter project?');
        return;
    }

    // Find all Dart files and analyze them
    const pages = await analyzePages(libPath, rootPath);

    if (pages.length === 0) {
        vscode.window.showInformationMessage('No pages with extractable strings found!');
        return;
    }

    // Show page selection
    const pageItems = pages.map(page => ({
        label: `$(file) ${page.fileName}`,
        description: `${page.stringCount} strings`,
        detail: page.relativePath,
        page: page
    }));

    const selectedPage = await vscode.window.showQuickPick(pageItems, {
        placeHolder: 'Select a page to localize',
        matchOnDescription: true,
        matchOnDetail: true
    });

    if (!selectedPage) {
        return;
    }

    // Process the selected page
    await processPage(selectedPage.page, rootPath);
}

async function analyzePages(libPath: string, rootPath: string): Promise<PageInfo[]> {
    const pages: PageInfo[] = [];
    const dartFiles = findDartFilesRecursive(libPath);

    for (const filePath of dartFiles) {
        const relativePath = path.relative(rootPath, filePath);

        // Skip l10n, generated files, etc.
        if (relativePath.includes('l10n') ||
            relativePath.includes('.g.dart') ||
            relativePath.includes('.freezed.dart') ||
            relativePath.includes('generated')) {
            continue;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const strings = extractStrings(content);
            const userFacingStrings = strings.filter(s => isUserFacingString(s.cleanText));

            if (userFacingStrings.length > 0) {
                pages.push({
                    fileName: path.basename(filePath),
                    filePath: filePath,
                    relativePath: relativePath,
                    strings: userFacingStrings,
                    stringCount: userFacingStrings.length
                });
            }
        } catch (error) {
            console.error(`Error analyzing ${filePath}:`, error);
        }
    }

    // Sort by string count (most strings first)
    return pages.sort((a, b) => b.stringCount - a.stringCount);
}

function findDartFilesRecursive(dir: string): string[] {
    const files: string[] = [];

    function traverse(currentDir: string) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                if (!entry.name.startsWith('.') && entry.name !== 'build') {
                    traverse(fullPath);
                }
            } else if (entry.isFile() && entry.name.endsWith('.dart')) {
                files.push(fullPath);
            }
        }
    }

    traverse(dir);
    return files;
}

async function processPage(page: PageInfo, rootPath: string): Promise<void> {
    // Show preview of strings to be extracted
    const previewItems = page.strings.map((s, i) => ({
        label: `${i + 1}. "${s.cleanText.substring(0, 50)}${s.cleanText.length > 50 ? '...' : ''}"`,
        description: `Line ${s.lineNumber}`,
        detail: `Key: ${generateKey(s.cleanText)}`,
        picked: true,
        string: s
    }));

    const selectedStrings = await vscode.window.showQuickPick(previewItems, {
        canPickMany: true,
        placeHolder: `Select strings to localize from ${page.fileName} (${page.stringCount} found)`,
        matchOnDescription: true
    });

    if (!selectedStrings || selectedStrings.length === 0) {
        vscode.window.showInformationMessage('No strings selected.');
        return;
    }

    const stringsToProcess = selectedStrings.map(item => item.string);

    // Open the file in editor
    const document = await vscode.workspace.openTextDocument(page.filePath);
    const editor = await vscode.window.showTextDocument(document);

    // Update ARB file first
    await updateArbFile(stringsToProcess);

    // Now update the code
    const importStatement = "import 'package:flutter_gen/gen_l10n/app_localizations.dart';";
    const text = document.getText();
    const hasImport = text.includes("gen_l10n/app_localizations.dart");

    // Sort strings in reverse order to avoid index drift
    const sortedStrings = [...stringsToProcess].sort((a, b) => b.index - a.index);

    try {
        await editor.edit(editBuilder => {
            // Add import if needed
            if (!hasImport) {
                editBuilder.insert(new vscode.Position(0, 0), importStatement + '\n');
            }

            // Replace strings
            for (const strObj of sortedStrings) {
                let startPos = document.positionAt(strObj.index);
                let endPos = document.positionAt(strObj.index + strObj.fullMatch.length);

                const key = generateKey(strObj.cleanText);
                let replacement = `AppLocalizations.of(context)!.${key}`;

                // Check for const removal
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

                const range = new vscode.Range(startPos, endPos);
                editBuilder.replace(range, replacement);
            }
        });

        // Show success with next action options
        const action = await vscode.window.showInformationMessage(
            `Localized ${selectedStrings.length} strings in ${page.fileName}`,
            'Localize Another Page',
            'Translate to Languages',
            'Done'
        );

        if (action === 'Localize Another Page') {
            await localizePageByPage();
        } else if (action === 'Translate to Languages') {
            await vscode.commands.executeCommand('flutterAutoLocalizer.translate');
        }

    } catch (error) {
        vscode.window.showErrorMessage(`Error processing ${page.fileName}: ${error}`);
    }
}

/**
 * Show localization status for all pages
 */
export async function showLocalizationStatus(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace open.');
        return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const libPath = path.join(rootPath, 'lib');

    if (!fs.existsSync(libPath)) {
        vscode.window.showErrorMessage('lib/ folder not found.');
        return;
    }

    const dartFiles = findDartFilesRecursive(libPath).filter(f => {
        const rel = path.relative(libPath, f);
        return !rel.includes('l10n') && !rel.includes('.g.dart');
    });

    let localizedPages = 0;
    let pendingPages = 0;
    let totalStrings = 0;
    let localizedStrings = 0;
    const pendingPagesList: string[] = [];

    for (const filePath of dartFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasLocalization = content.includes('AppLocalizations.of(context)');
        const strings = extractStrings(content).filter(s => isUserFacingString(s.cleanText));

        if (strings.length > 0) {
            totalStrings += strings.length;
            if (hasLocalization) {
                localizedPages++;
                // Count how many strings are NOT localized (still have quotes)
                localizedStrings += strings.length; // Approximate
            } else {
                pendingPages++;
                pendingPagesList.push(path.basename(filePath));
            }
        }
    }

    // Create status report
    const statusContent = `# Localization Status Report

## Summary
- **Localized Pages:** ${localizedPages}
- **Pending Pages:** ${pendingPages}
- **Total Extractable Strings:** ${totalStrings}

## Pages Needing Localization
${pendingPagesList.length > 0 ? pendingPagesList.map(p => `- ${p}`).join('\n') : '- All pages are localized!'}

## Next Steps
${pendingPages > 0 ? `
1. Run "Flutter Auto Localizer: Page by Page" to localize remaining pages
2. Select strings to localize from each page
3. Run "Flutter Auto Localizer: Translate" to generate translations
` : `
All pages are localized! Run "Flutter Auto Localizer: Translate" to add more languages.
`}
`;

    const doc = await vscode.workspace.openTextDocument({
        content: statusContent,
        language: 'markdown'
    });
    await vscode.window.showTextDocument(doc, { preview: true });
}
