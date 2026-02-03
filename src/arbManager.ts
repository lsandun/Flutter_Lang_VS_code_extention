import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ExtractedString, PlaceholderInfo } from './stringExtractor';

/**
 * Generate a camelCase key from text
 */
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

    // Ensure key is not too long (max 50 chars)
    if (key.length > 50) {
        key = key.substring(0, 50);
    }

    // Ensure key starts with a letter
    if (!/^[a-zA-Z]/.test(key)) {
        key = 'text' + key;
    }

    return key;
}

/**
 * Generate placeholder metadata for ARB file
 * This is required for Flutter's l10n system to recognize placeholders
 */
function generatePlaceholderMetadata(placeholders: PlaceholderInfo[]): Record<string, { type: string; example?: string }> {
    const metadata: Record<string, { type: string; example?: string }> = {};

    for (const placeholder of placeholders) {
        metadata[placeholder.name] = {
            type: 'String', // Default to String, could be enhanced to detect types
        };
    }

    return metadata;
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

    // Using any for ARB content as it has mixed value types
    let arbContent: Record<string, any> = { "@@locale": locale };

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

        // Prevent overwriting existing keys
        if (!arbContent[key]) {
            // Use arbValue for strings with placeholders, cleanText for regular strings
            arbContent[key] = strObj.hasPlaceholders ? strObj.arbValue : strObj.cleanText;
            joinedCount++;

            // Add placeholder metadata if needed
            if (strObj.hasPlaceholders && strObj.placeholders.length > 0) {
                const metadataKey = `@${key}`;
                arbContent[metadataKey] = {
                    description: `Auto-extracted string with ${strObj.placeholders.length} placeholder(s)`,
                    placeholders: generatePlaceholderMetadata(strObj.placeholders)
                };
            }
        }
    }

    // Write back to file with proper formatting
    // Sort keys to keep @@locale first, then regular keys, then @metadata keys
    const sortedContent: Record<string, any> = {};

    // Add @@locale first
    if (arbContent['@@locale']) {
        sortedContent['@@locale'] = arbContent['@@locale'];
    }

    // Add regular keys (non-@ keys)
    Object.keys(arbContent)
        .filter(k => !k.startsWith('@'))
        .sort()
        .forEach(k => {
            sortedContent[k] = arbContent[k];
            // Add metadata right after the key if it exists
            const metaKey = `@${k}`;
            if (arbContent[metaKey]) {
                sortedContent[metaKey] = arbContent[metaKey];
            }
        });

    fs.writeFileSync(arbFilePath, JSON.stringify(sortedContent, null, 2), 'utf8');

    if (joinedCount > 0) {
        vscode.window.showInformationMessage(`Added ${joinedCount} new keys to ${filename}`);
    } else {
        vscode.window.showInformationMessage(`No new keys added to ${filename}`);
    }
}

/**
 * Get all keys from an ARB file
 */
export function getArbKeys(arbFilePath: string): string[] {
    if (!fs.existsSync(arbFilePath)) {
        return [];
    }

    try {
        const content = JSON.parse(fs.readFileSync(arbFilePath, 'utf8'));
        return Object.keys(content).filter(k => !k.startsWith('@'));
    } catch {
        return [];
    }
}
