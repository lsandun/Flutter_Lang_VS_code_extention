"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractStrings = extractStrings;
function extractStrings(code) {
    const results = [];
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
//# sourceMappingURL=stringExtractor.js.map