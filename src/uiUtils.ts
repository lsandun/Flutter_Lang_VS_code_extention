import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SUPPORTED_LANGUAGES } from './languages';

/**
 * Enhanced Language Picker with better UX
 * - Shows already translated languages at top with ✓ icon
 * - Groups: "Already Translated" and "Available Languages"
 * - Pre-selects existing languages
 */

interface LanguagePickItem extends vscode.QuickPickItem {
    code: string;
    isTranslated: boolean;
}

export async function showLanguagePicker(options?: {
    title?: string;
    placeholder?: string;
    includeExisting?: boolean;
}): Promise<string[] | undefined> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace open.');
        return undefined;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const l10nDir = path.join(rootPath, 'lib', 'l10n');

    // Get existing translations
    const existingLocales = new Set<string>();
    if (fs.existsSync(l10nDir)) {
        const files = fs.readdirSync(l10nDir);
        files.forEach((file: string) => {
            const match = file.match(/^app_([a-zA-Z-]+)\.arb$/);
            if (match && match[1] !== 'en') {
                existingLocales.add(match[1]);
            }
        });
    }

    // Build picker items
    const translatedItems: LanguagePickItem[] = [];
    const availableItems: LanguagePickItem[] = [];

    for (const lang of SUPPORTED_LANGUAGES) {
        const code = lang.description!;
        const isTranslated = existingLocales.has(code);

        const item: LanguagePickItem = {
            label: isTranslated ? `$(check) ${lang.label}` : `$(globe) ${lang.label}`,
            description: code,
            detail: isTranslated ? '✓ Already translated - select to sync/update' : 'Not yet translated',
            picked: isTranslated, // Pre-select existing
            code: code,
            isTranslated: isTranslated
        };

        if (isTranslated) {
            translatedItems.push(item);
        } else {
            availableItems.push(item);
        }
    }

    // Create grouped items with separators
    const allItems: (LanguagePickItem | vscode.QuickPickItem)[] = [];

    if (translatedItems.length > 0) {
        allItems.push({
            label: '── Already Translated ──',
            kind: vscode.QuickPickItemKind.Separator
        } as vscode.QuickPickItem);
        allItems.push(...translatedItems);
    }

    allItems.push({
        label: '── Available Languages ──',
        kind: vscode.QuickPickItemKind.Separator
    } as vscode.QuickPickItem);
    allItems.push(...availableItems);

    // Show picker
    const selected = await vscode.window.showQuickPick(allItems as LanguagePickItem[], {
        canPickMany: true,
        placeHolder: options?.placeholder || '🌍 Select languages to translate (existing languages at top)',
        title: options?.title || 'Flutter L10n: Select Target Languages',
        matchOnDescription: true,
        matchOnDetail: true
    });

    if (!selected || selected.length === 0) {
        return undefined;
    }

    // Filter out separators and return codes
    return selected
        .filter((item): item is LanguagePickItem => 'code' in item)
        .map(item => item.code);
}

/**
 * Show processing progress with detailed status
 */
export class ProcessingProgress {
    private outputChannel: vscode.OutputChannel;
    private statusBarItem: vscode.StatusBarItem;

    constructor(name: string) {
        this.outputChannel = vscode.window.createOutputChannel(`Flutter L10n: ${name}`);
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.text = '$(sync~spin) Flutter L10n: Processing...';
        this.statusBarItem.show();
    }

    log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const icon = {
            'info': 'ℹ️',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️'
        }[type];

        this.outputChannel.appendLine(`[${timestamp}] ${icon} ${message}`);
    }

    updateStatus(text: string) {
        this.statusBarItem.text = `$(sync~spin) ${text}`;
    }

    show() {
        this.outputChannel.show(true);
    }

    complete(summary: string) {
        this.statusBarItem.text = `$(check) Flutter L10n: Complete`;
        this.log(summary, 'success');
        this.log('─'.repeat(50));

        // Hide status bar after 5 seconds
        setTimeout(() => {
            this.statusBarItem.hide();
        }, 5000);
    }

    error(message: string) {
        this.statusBarItem.text = `$(error) Flutter L10n: Error`;
        this.log(message, 'error');

        setTimeout(() => {
            this.statusBarItem.hide();
        }, 5000);
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}

/**
 * Show changes summary in a nice format
 */
export async function showChangesSummary(changes: {
    filesModified: string[];
    stringsExtracted: number;
    languagesTranslated: string[];
    arbFilesCreated: string[];
    arbFilesUpdated: string[];
}): Promise<void> {
    const content = `# 📊 Flutter L10n - Changes Summary

## Overview
- **Strings Extracted:** ${changes.stringsExtracted}
- **Languages Translated:** ${changes.languagesTranslated.length}
- **Files Modified:** ${changes.filesModified.length}

---

## 📝 Modified Dart Files
${changes.filesModified.length > 0
            ? changes.filesModified.map(f => `- \`${f}\``).join('\n')
            : '- No files modified'}

---

## 🌍 Languages Translated
${changes.languagesTranslated.length > 0
            ? changes.languagesTranslated.map(l => `- ${l}`).join('\n')
            : '- No translations'}

---

## 📁 ARB Files

### Created:
${changes.arbFilesCreated.length > 0
            ? changes.arbFilesCreated.map(f => `- \`${f}\` (new)`).join('\n')
            : '- None'}

### Updated:
${changes.arbFilesUpdated.length > 0
            ? changes.arbFilesUpdated.map(f => `- \`${f}\``).join('\n')
            : '- None'}

---

## ✅ Next Steps

1. Run \`flutter pub get\` if this is your first time
2. Run \`flutter gen-l10n\` or restart your IDE
3. Use \`AppLocalizations.of(context)!.keyName\` in your code
4. Test language switching in your app!

---

*Generated by Flutter Auto Localizer*
`;

    const doc = await vscode.workspace.openTextDocument({
        content: content,
        language: 'markdown'
    });
    await vscode.window.showTextDocument(doc, {
        preview: true,
        viewColumn: vscode.ViewColumn.Beside
    });
}

/**
 * Get workspace info
 */
export function getWorkspaceInfo(): { rootPath: string; l10nDir: string; hasL10n: boolean } | null {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return null;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const l10nDir = path.join(rootPath, 'lib', 'l10n');

    return {
        rootPath,
        l10nDir,
        hasL10n: fs.existsSync(l10nDir)
    };
}

/**
 * Check if app_en.arb exists
 */
export function hasSourceArb(): boolean {
    const workspace = getWorkspaceInfo();
    if (!workspace) return false;

    const appEnPath = path.join(workspace.l10nDir, 'app_en.arb');
    return fs.existsSync(appEnPath);
}

/**
 * Get list of existing language codes
 */
export function getExistingLanguages(): string[] {
    const workspace = getWorkspaceInfo();
    if (!workspace || !workspace.hasL10n) return [];

    const languages: string[] = [];
    const files = fs.readdirSync(workspace.l10nDir);

    files.forEach((file: string) => {
        const match = file.match(/^app_([a-zA-Z-]+)\.arb$/);
        if (match) {
            languages.push(match[1]);
        }
    });

    return languages;
}

/**
 * Show quick notification with actions
 */
export async function showNotificationWithActions(
    message: string,
    type: 'info' | 'warning' | 'error',
    actions: string[]
): Promise<string | undefined> {
    const showFn = {
        'info': vscode.window.showInformationMessage,
        'warning': vscode.window.showWarningMessage,
        'error': vscode.window.showErrorMessage
    }[type];

    return await showFn(message, ...actions);
}
