export interface ExtractedString {
    text: string;
    lineNumber: number;
    index: number;
}

export function extractStrings(code: string): ExtractedString[] {
    const results: ExtractedString[] = [];
    // Regex to match comments, imports, and strings. 
    // We only care about capturing group 4 (strings).
    const regex = /(?:(\/\/.*)|(\/\*[\s\S]*?\*\/)|(import\s+['"][^'"]+['"])|((['"])(?:(?!\5|\\).|\\.)*\5))/g;

    let match;
    while ((match = regex.exec(code)) !== null) {
        // Group 4 contains the string literal (including quotes)
        if (match[4]) {
            // Calculate line number based on newlines before the match
            const lineNumber = code.substring(0, match.index).split('\n').length;
            results.push({
                text: match[4],
                lineNumber: lineNumber,
                index: match.index
            });
        }
    }
    return results;
}
