export interface ExtractedString {
    text: string; // Deprecated, kept for backward compatibility if needed
    cleanText: string;
    fullMatch: string;
    lineNumber: number;
    index: number;
}

export function extractStrings(code: string): ExtractedString[] {
    const results: ExtractedString[] = [];
    // Regex to match comments, imports, triple quotes, and single/double quoted strings.
    // Group 1: Single line comment
    // Group 2: Multi line comment
    // Group 3: Import statements
    // Group 4: Triple single quotes (ignore)
    // Group 5: Triple double quotes (ignore)
    // Group 6: Single/Double quoted strings (Capture) - with backref to Group 7
    const regex = /(?:(\/\/.*)|(\/\*[\s\S]*?\*\/)|(import\s+['"][^'"]+['"])|('''[\s\S]*?''')|("""[\s\S]*?""")|((['"])(?:(?!\7|\\).|\\.)*\7))/g;

    let match;
    while ((match = regex.exec(code)) !== null) {
        // Group 6 contains the string literal (including quotes)
        if (match[6]) {
            const fullMatch = match[6];

            // 1. Ignore if contains interpolation '$'
            if (fullMatch.includes('$')) {
                continue;
            }

            // 2. Remove quotes
            const cleanText = fullMatch.substring(1, fullMatch.length - 1);

            // Calculate line number based on newlines before the match
            const lineNumber = code.substring(0, match.index).split('\n').length;
            results.push({
                text: cleanText, // Keeping this as cleanText for now
                cleanText: cleanText,
                fullMatch: fullMatch,
                lineNumber: lineNumber,
                index: match.index
            });
        }
    }
    return results;
}
