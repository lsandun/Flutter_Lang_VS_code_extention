import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { translate } from 'google-translate-api-x';
import { ExtractedString } from './stringExtractor';

// TARGET_LANGUAGES is now dynamic based on arguments

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function translateStrings(strings: ExtractedString[], targetLocales: string[]) {
    // Note: We ignore the passed 'strings' argument and use app_en.arb as source of truth
    // to ensure we sync all missing keys, not just the newly extracted ones.

    vscode.window.showInformationMessage(`Syncing translations for [${targetLocales.join(', ')}] in background...`);

    const TARGET_LANGUAGES = targetLocales.map(code => ({
        code: code,
        filename: `app_${code}.arb`
    }));

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        console.error('No workspace open for translation.');
        return;
    }
    const rootPath = workspaceFolders[0].uri.fsPath;
    const l10nDir = path.join(rootPath, 'lib', 'l10n');
    const sourcePath = path.join(l10nDir, 'app_en.arb');

    if (!fs.existsSync(sourcePath)) {
        console.error('Source ARB file (app_en.arb) not found.');
        return;
    }

    let sourceContent: Record<string, string> = {};
    try {
        sourceContent = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    } catch (e) {
        console.error('Failed to parse app_en.arb');
        return;
    }

    for (const lang of TARGET_LANGUAGES) {
        try {
            const targetPath = path.join(l10nDir, lang.filename);
            let targetContent: Record<string, string> = { "@@locale": lang.code };

            if (fs.existsSync(targetPath)) {
                try {
                    targetContent = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
                } catch (e) {
                    // Start fresh if corrupt
                    console.warn(`Corrupt ${lang.filename}, starting fresh.`);
                }
            }

            let missingKeysCount = 0;
            const keysToTranslate: string[] = [];

            // Identify missing keys
            for (const key in sourceContent) {
                if (key.startsWith('@')) continue; // Skip metadata
                if (!targetContent[key]) {
                    keysToTranslate.push(key);
                }
            }

            if (keysToTranslate.length === 0) {
                console.log(`No missing translations for ${lang.code}`);
                continue;
            }

            console.log(`Translating ${keysToTranslate.length} missing keys for ${lang.code}...`);

            for (const key of keysToTranslate) {
                const sourceText = sourceContent[key];
                try {
                    const res = await translate(sourceText, { to: lang.code });
                    targetContent[key] = res.text;
                    missingKeysCount++;
                    // Rate limiting delay
                    await delay(300);
                } catch (err) {
                    console.error(`Failed to translate key '${key}' to ${lang.code}:`, err);
                }
            }

            if (missingKeysCount > 0) {
                fs.writeFileSync(targetPath, JSON.stringify(targetContent, null, 2), 'utf8');
                console.log(`Synced ${missingKeysCount} missing translations for ${lang.code}`);
                vscode.window.showInformationMessage(`Synced ${missingKeysCount} translations for ${lang.code}`);
            }

        } catch (error) {
            console.error(`Error processing language ${lang.code}:`, error);
            vscode.window.showErrorMessage(`Failed to generate ${lang.filename}. Check console for details.`);
        }
    }

    vscode.window.showInformationMessage('Translation sync completed!');
}
