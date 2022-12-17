import {ReleaseType} from "./ReleaseType";

const Keywords = {
    // Closing keywords of GitHub and GitLab
    "fix": "patch",
    "fix!": "major",
    "fixes": "patch",
    "fixes!": "major",
    "fixed": "patch",
    "fixed!": "major",
    "fixing": "patch",
    "fixing!": "major",
    "resolve": "minor",
    "resolve!": "major",
    "resolves": "minor",
    "resolves!": "major",
    "resolved": "minor",
    "resolved!": "major",
    "resolving": "minor",
    "resolving!": "major",
    "close": "minor",
    "close!": "major",
    "closes": "minor",
    "closes!": "major",
    "closed": "minor",
    "closed!": "major",
    "closing": "minor",
    "closing!": "major",
    // My favorite keywords
    "hotfix": "patch",
    "hotfix!": "major",
    "feat": "minor",
    "feat!": "major",
    "feature": "minor",
    "feature!": "major",
    "refactor": "minor",
    "refactor!": "major",
    "refactors": "minor",
    "refactors!": "major",
    "refactored": "minor",
    "refactored!": "major",
    "refactoring": "minor",
    "refactoring!": "major",
} as const;

export type KeywordReleaseTypeMap = {
    [key: string]: ReleaseType
}

export function getDefaultKeywordReleaseTypeMap(): KeywordReleaseTypeMap {
    return Keywords;
}

/**
 * Returns a regex that matches one of given keywords.
 * It returns a regex that matches nothing when {@link keywords}.
 * @param keywords
 * @return a regex that matches one of given keywords.
 */
export function getKeywordRegex(keywords: string[]): RegExp {
    if (keywords.length === 0) {
        return new RegExp("$a^");   // Regular expression that matches nothing.
    }
    const regex = keywords
        .sort((a, b) => b.length - a.length)    // The longest keyword appears first
        .map(s => escapeRegExp(s))
        .map(s => `^${s}`)
        .reduce((acc, a) => `${acc}|${a}`);
    return new RegExp(regex);
}

function escapeRegExp(text: string) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Extract a keyword from a line using a given regex.
 * Returns {@code null} when {@link keywordRegex} doesn't match to the line.
 */
export function extractKeyword(line: string, keywordRegex: RegExp): string | null {
    const result = line.match(keywordRegex);
    if (result === null || result.length === 0) {
        return null;
    }
    return result[0];
}

/**
 * Get a {@link ReleaseType} of a keyword.
 * If the keyword found in {@link keywords}, it throws {@link Error}.
 */
export function keywordToReleaseType(keyword: string, keywords: KeywordReleaseTypeMap): ReleaseType {
    const ret = keywords[keyword];
    if (ret === undefined) {
        throw new Error(`No such keyword ${keyword} is found.`);
    }
    return ret;
}
