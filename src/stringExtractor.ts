export interface ExtractedString {
    text: string; // Deprecated, kept for backward compatibility if needed
    cleanText: string;
    fullMatch: string;
    lineNumber: number;
    index: number;
    hasPlaceholders: boolean;
    placeholders: PlaceholderInfo[];
    arbValue: string; // The ARB-formatted string with {placeholders}
}

export interface PlaceholderInfo {
    name: string;
    originalExpression: string;
    type: 'simple' | 'expression'; // $name vs ${expression}
}

/**
 * Extract localizable strings from Dart code
 * Now supports placeholders/interpolation!
 */
export function extractStrings(code: string, options: { includePlaceholders?: boolean } = {}): ExtractedString[] {
    const results: ExtractedString[] = [];
    const includePlaceholders = options.includePlaceholders ?? false;

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

            // Remove quotes
            const cleanText = fullMatch.substring(1, fullMatch.length - 1);

            // Check for interpolation
            const hasInterpolation = fullMatch.includes('$');

            if (hasInterpolation && !includePlaceholders) {
                // Skip interpolated strings when not including placeholders
                continue;
            }

            // Parse placeholders if present
            const { arbValue, placeholders } = parseInterpolation(cleanText);

            // Calculate line number based on newlines before the match
            const lineNumber = code.substring(0, match.index).split('\n').length;

            results.push({
                text: cleanText,
                cleanText: hasInterpolation ? getCleanTextWithoutPlaceholders(cleanText) : cleanText,
                fullMatch: fullMatch,
                lineNumber: lineNumber,
                index: match.index,
                hasPlaceholders: placeholders.length > 0,
                placeholders: placeholders,
                arbValue: arbValue
            });
        }
    }
    return results;
}

/**
 * Parse Dart string interpolation and convert to ARB format
 * - $variableName → {variableName}
 * - ${expression} → {expression} (simplified)
 */
function parseInterpolation(text: string): { arbValue: string; placeholders: PlaceholderInfo[] } {
    const placeholders: PlaceholderInfo[] = [];

    // Match ${expression} first (more specific)
    // Then match $variableName
    const expressionRegex = /\$\{([^}]+)\}/g;
    const simpleRegex = /\$([a-zA-Z_][a-zA-Z0-9_]*)/g;

    let arbValue = text;
    const processedPositions = new Set<number>();

    // Process ${expression} patterns
    let exprMatch;
    while ((exprMatch = expressionRegex.exec(text)) !== null) {
        const expression = exprMatch[1];
        const paramName = extractParamName(expression);

        // Mark positions as processed
        for (let i = exprMatch.index; i < exprMatch.index + exprMatch[0].length; i++) {
            processedPositions.add(i);
        }

        // Avoid duplicate placeholders
        if (!placeholders.some(p => p.name === paramName)) {
            placeholders.push({
                name: paramName,
                originalExpression: exprMatch[0],
                type: 'expression'
            });
        }
    }

    // Process $variable patterns (only if not already processed)
    let simpleMatch;
    const tempText = text;
    simpleRegex.lastIndex = 0;
    while ((simpleMatch = simpleRegex.exec(tempText)) !== null) {
        // Skip if this position was part of an ${expression}
        if (processedPositions.has(simpleMatch.index)) {
            continue;
        }

        const varName = simpleMatch[1];

        if (!placeholders.some(p => p.name === varName)) {
            placeholders.push({
                name: varName,
                originalExpression: simpleMatch[0],
                type: 'simple'
            });
        }
    }

    // Convert to ARB format
    // Replace ${expression} with {paramName}
    arbValue = arbValue.replace(/\$\{([^}]+)\}/g, (match, expr) => {
        return `{${extractParamName(expr)}}`;
    });

    // Replace $variable with {variable}
    arbValue = arbValue.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, varName) => {
        return `{${varName}}`;
    });

    return { arbValue, placeholders };
}

/**
 * Extract a clean parameter name from an expression
 * e.g., "user.name" → "userName", "items.length" → "itemsLength"
 */
function extractParamName(expression: string): string {
    // Handle method calls: item.toString() → item
    const cleaned = expression.replace(/\(\)$/, '').trim();

    // Handle property access: user.name → userName
    if (cleaned.includes('.')) {
        const parts = cleaned.split('.');
        // Take last meaningful part or combine
        if (parts.length === 2) {
            return parts[0] + parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        }
        return parts[parts.length - 1];
    }

    // Handle array access: items[0] → items0
    if (cleaned.includes('[')) {
        return cleaned.replace(/\[(\d+)\]/g, '$1').replace(/\[.*?\]/g, '');
    }

    return cleaned;
}

/**
 * Get clean text for key generation (without placeholder markers)
 */
function getCleanTextWithoutPlaceholders(text: string): string {
    return text
        .replace(/\$\{[^}]+\}/g, '') // Remove ${expression}
        .replace(/\$[a-zA-Z_][a-zA-Z0-9_]*/g, '') // Remove $variable
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

/**
 * Check if a string is likely user-facing text (not a technical string)
 */
export function isUserFacingString(text: string): boolean {
    // Skip very short strings
    if (text.length < 2) return false;

    // Skip strings that look like:
    // - File paths
    // - URLs
    // - Package names
    // - Color hex codes
    // - Technical identifiers

    const technicalPatterns = [
        /^https?:\/\//i,           // URLs
        /^[a-z]+:\/\//i,           // Other URLs
        /^\//,                      // Paths starting with /
        /^\.\.?\//,                 // Relative paths
        /^#[0-9a-fA-F]{3,8}$/,     // Hex colors
        /^[a-z_]+\.[a-z_]+/i,      // Package/class names
        /^[A-Z_]+$/,                // CONSTANTS
        /^\d+$/,                    // Pure numbers
        /^[a-z]+_[a-z]+$/i,        // snake_case identifiers
        /^assets\//i,               // Asset paths
        /^images\//i,               // Image paths
        /^fonts\//i,                // Font paths
        /\.dart$/i,                 // Dart file paths
        /\.json$/i,                 // JSON file paths
        /\.png$/i,                  // Image files
        /\.jpg$/i,
        /\.svg$/i,
        /^[\s\n\t]*$/,              // Whitespace only
    ];

    return !technicalPatterns.some(pattern => pattern.test(text));
}
