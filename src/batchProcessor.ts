import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { extractStrings, ExtractedString } from './stringExtractor';
import { updateArbFile, generateKey } from './arbManager';

interface FileResult {
    filePath: string;
    stringsFound: number;
    success: boolean;
    error?: string;
}

/**
 * Batch process all Dart files in the project
 * Extracts strings from all files and updates ARB
 */
export async function batchProcessAllFiles(): Promise<void> {
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

    // Find all Dart files
    const dartFiles = findDartFiles(libPath);

    if (dartFiles.length === 0) {
        vscode.window.showInformationMessage('No Dart files found in lib/');
        return;
    }

    // Exclude certain directories/files
    const filteredFiles = dartFiles.filter(file => {
        const relativePath = path.relative(libPath, file);
        // Exclude generated files, l10n directory, and test files
        return !relativePath.includes('l10n') &&
            !relativePath.includes('.g.dart') &&
            !relativePath.includes('.freezed.dart') &&
            !relativePath.includes('generated');
    });

    // Show confirmation
    const proceed = await vscode.window.showQuickPick(
        ['Yes, process all files', 'No, cancel'],
        {
            placeHolder: `Found ${filteredFiles.length} Dart files. Process all?`
        }
    );

    if (proceed !== 'Yes, process all files') {
        return;
    }

    // Process with progress
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Flutter Auto Localizer - Batch Processing",
        cancellable: true
    }, async (progress, token) => {
        const results: FileResult[] = [];
        const allStrings: ExtractedString[] = [];
        let processedCount = 0;

        for (const filePath of filteredFiles) {
            if (token.isCancellationRequested) {
                vscode.window.showWarningMessage('Batch processing cancelled.');
                return;
            }

            const relativePath = path.relative(rootPath, filePath);
            progress.report({
                message: `Processing: ${relativePath}`,
                increment: (1 / filteredFiles.length) * 100
            });

            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const strings = extractStrings(content);

                if (strings.length > 0) {
                    allStrings.push(...strings);
                    results.push({
                        filePath: relativePath,
                        stringsFound: strings.length,
                        success: true
                    });
                }

                processedCount++;
            } catch (error) {
                results.push({
                    filePath: relativePath,
                    stringsFound: 0,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }

            // Small delay to keep UI responsive
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Update ARB file with all collected strings
        if (allStrings.length > 0) {
            // Remove duplicates based on cleanText
            const uniqueStrings = removeDuplicateStrings(allStrings);
            await updateArbFile(uniqueStrings);

            progress.report({ message: 'Strings extracted! Updating files...' });
        }

        // Show summary
        const filesWithStrings = results.filter(r => r.stringsFound > 0);
        const totalStrings = results.reduce((sum, r) => sum + r.stringsFound, 0);

        if (totalStrings > 0) {
            const updateCode = await vscode.window.showQuickPick(
                ['Yes, update code in all files', 'No, only extract strings'],
                {
                    placeHolder: `Found ${totalStrings} strings in ${filesWithStrings.length} files. Update code to use AppLocalizations?`
                }
            );

            if (updateCode === 'Yes, update code in all files') {
                await updateCodeInFiles(filteredFiles, progress);
            }
        }

        // Final message
        vscode.window.showInformationMessage(
            `Batch processing complete! Processed ${processedCount} files, found ${totalStrings} strings.`
        );
    });
}

function findDartFiles(dir: string): string[] {
    const files: string[] = [];

    function traverse(currentDir: string) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                // Skip hidden directories and common non-source directories
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

function removeDuplicateStrings(strings: ExtractedString[]): ExtractedString[] {
    const seen = new Set<string>();
    return strings.filter(s => {
        const key = s.cleanText;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

async function updateCodeInFiles(files: string[], progress: vscode.Progress<{ message?: string; increment?: number }>): Promise<void> {
    const importStatement = "import 'package:flutter_gen/gen_l10n/app_localizations.dart';";

    for (const filePath of files) {
        progress.report({ message: `Updating: ${path.basename(filePath)}` });

        try {
            let content = fs.readFileSync(filePath, 'utf8');
            const strings = extractStrings(content);

            if (strings.length === 0) {
                continue;
            }

            // Add import if needed
            const hasImport = content.includes("gen_l10n/app_localizations.dart");
            if (!hasImport) {
                content = importStatement + '\n' + content;
            }

            // Sort strings in reverse order to avoid index drift
            const sortedStrings = [...strings].sort((a, b) => b.index - a.index);

            // Adjust indices if import was added
            const indexOffset = hasImport ? 0 : importStatement.length + 1;

            for (const strObj of sortedStrings) {
                const key = generateKey(strObj.cleanText);
                const replacement = `AppLocalizations.of(context)!.${key}`;

                // Adjust index for added import
                const adjustedIndex = strObj.index + indexOffset;

                // Handle const removal
                const lookbehindLength = 50;
                const startOffset = Math.max(0, adjustedIndex - lookbehindLength);
                const textBefore = content.substring(startOffset, adjustedIndex);

                const constMatch = textBefore.match(/(const)\s+(Text\s*\()$/);

                if (constMatch && constMatch.index !== undefined) {
                    // Remove const and replace string
                    const absStartIndex = startOffset + constMatch.index;
                    content = content.substring(0, absStartIndex) +
                        constMatch[2] + replacement +
                        content.substring(adjustedIndex + strObj.fullMatch.length);
                } else {
                    // Just replace string
                    content = content.substring(0, adjustedIndex) +
                        replacement +
                        content.substring(adjustedIndex + strObj.fullMatch.length);
                }
            }

            fs.writeFileSync(filePath, content, 'utf8');
        } catch (error) {
            console.error(`Error updating ${filePath}:`, error);
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

/**
 * Preview what will be extracted without making changes
 */
export async function previewBatchExtraction(): Promise<void> {
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

    const dartFiles = findDartFiles(libPath).filter(file => {
        const relativePath = path.relative(libPath, file);
        return !relativePath.includes('l10n') &&
            !relativePath.includes('.g.dart') &&
            !relativePath.includes('.freezed.dart');
    });

    const previewData: { file: string; strings: string[] }[] = [];

    for (const filePath of dartFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        const strings = extractStrings(content);

        if (strings.length > 0) {
            previewData.push({
                file: path.relative(rootPath, filePath),
                strings: strings.map(s => s.cleanText)
            });
        }
    }

    if (previewData.length === 0) {
        vscode.window.showInformationMessage('No extractable strings found in the project.');
        return;
    }

    // Create preview document
    const previewContent = generatePreviewContent(previewData);
    const doc = await vscode.workspace.openTextDocument({
        content: previewContent,
        language: 'markdown'
    });

    await vscode.window.showTextDocument(doc, { preview: true });
}

function generatePreviewContent(data: { file: string; strings: string[] }[]): string {
    let content = '# 🔍 String Extraction Preview\n\n';
    content += `**Total Files:** ${data.length}\n`;
    content += `**Total Strings:** ${data.reduce((sum, d) => sum + d.strings.length, 0)}\n\n`;
    content += '---\n\n';

    for (const item of data) {
        content += `## 📄 ${item.file}\n\n`;
        for (const str of item.strings) {
            const key = generateKey(str);
            content += `- \`${key}\`: "${str}"\n`;
        }
        content += '\n';
    }

    content += '---\n\n';
    content += '> Run "Flutter Auto Localizer: Batch Process All Files" to extract these strings.\n';

    return content;
}
