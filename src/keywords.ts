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

export function getKeywordRegex(keywordReleaseTypeMap: KeywordReleaseTypeMap): RegExp {
    // The longest keyword comes to head.
    const keywords = Object.keys(keywordReleaseTypeMap).sort((a, b) => b.length - a.length);
    const regex = keywords.reduce((acc, a) => `${acc}|${a}`);
    return new RegExp(regex);
}

export function extractKeyword(line: string, keywordRegex: RegExp): string | null {
    const result = line.match(keywordRegex);
    if (result === null || result.length === 0) {
        return null;
    }
    return result[0];
}

export function keywordToReleaseType(keyword: string, keywords: KeywordReleaseTypeMap): ReleaseType {
    const ret = keywords[keyword];
    if (ret === undefined) {
        throw new Error(`No such keyword ${keyword} is found.`);
    }
    return ret;
}
