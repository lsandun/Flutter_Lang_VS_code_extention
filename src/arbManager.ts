import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ExtractedString } from './stringExtractor';

export function generateKey(text: string): string {
    // 1. Remove special characters (keep alphanumeric and spaces)
    // 2. Split by space to get words
    // 3. Convert to camelCase

    // allow alphanumeric, spaces, and underscores. trim start/end.
    const cleanText = text.replace(/[^a-zA-Z0-9 ]/g, "").trim();

    if (!cleanText) {
        return "text"; // Fallback for purely special char strings
    }

    const words = cleanText.split(/\s+/);

    // Handle first word (lowercase)
    let key = words[0].toLowerCase();

    // Handle subsequent words (capitalize first letter)
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        if (word.length > 0) {
            key += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
    }

    return key;
}

export async function updateArbFile(strings: ExtractedString[], locale: string = 'en', filename: string = 'app_en.arb'): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace open. Cannot find ARB file.');
        return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const l10nDir = path.join(rootPath, 'lib', 'l10n');
    const arbFilePath = path.join(l10nDir, filename);

    // Ensure directory exists
    if (!fs.existsSync(l10nDir)) {
        fs.mkdirSync(l10nDir, { recursive: true });
    }

    let arbContent: Record<string, string> = { "@@locale": locale };

    // Read existing file
    if (fs.existsSync(arbFilePath)) {
        try {
            const fileData = fs.readFileSync(arbFilePath, 'utf8');
            arbContent = JSON.parse(fileData);
        } catch (e) {
            vscode.window.showErrorMessage('Error reading existing ARB file. Starting fresh.');
        }
    }

    let joinedCount = 0;

    // Update with new strings
    for (const strObj of strings) {
        const key = generateKey(strObj.cleanText);

        // Prevent overwriting existing keys implies we check if key exists
        // But what if different text maps to same key? 
        // For this step, if key exists, we skip (simple collision handling). 
        if (!arbContent[key]) {
            arbContent[key] = strObj.cleanText;
            joinedCount++;
        }
    }

    // Write back to file
    fs.writeFileSync(arbFilePath, JSON.stringify(arbContent, null, 2), 'utf8');

    if (joinedCount > 0) {
        vscode.window.showInformationMessage(`Added ${joinedCount} new keys to ${filename}`);
    } else {
        vscode.window.showInformationMessage(`No new keys added to ${filename}`);
    }
}
