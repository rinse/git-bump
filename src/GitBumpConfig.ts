import path from "path";
import fs from "fs";
import {InvalidGitBumpConfigsError} from "./InvalidGitBumpConfigsError";

export type ReleaseTypeKeywordMap = {
    major: string[],
    minor: string[],
    patch: string[],
}

export type GitBumpConfig = {
    keywords: ReleaseTypeKeywordMap,
}

const GIT_BUMP_CONFIG_FILE_NAME = ".git-bump.json";

export function readGitBumpConfigJson(dirPath: string): GitBumpConfig {
    const gitBumpConfigFilePath = path.join(dirPath, GIT_BUMP_CONFIG_FILE_NAME);
    if (!fs.existsSync(gitBumpConfigFilePath)) {
        return EMPTY_CONFIG;
    }
    const text = fs.readFileSync(gitBumpConfigFilePath, "utf-8");
    const obj = JSON.parse(text);
    return makeValidGitBumpConfig(obj) ?? EMPTY_CONFIG;
}

/**
 * Merge two configs.
 *
 * It filters duplicate keywords in a release type and among the release types.
 * As filtering keywords, the most prioritized occurrence is picked in the following priority:
 *
 * 1. keywords in the first argument < keywords in the seconds argument
 * 2. patch < minor < major
 */
export function mergeGitBumpConfigs(a: GitBumpConfig, b: GitBumpConfig): GitBumpConfig {
    const remover = new DuplicationRemover<string>();
    const bMajor = [...remover.filterRemovals(b.keywords.major)];
    const bMinor = [...remover.filterRemovals(b.keywords.minor)];
    const bPatch = [...remover.filterRemovals(b.keywords.patch)];
    const aMajor = [...remover.filterRemovals(a.keywords.major)];
    const aMinor = [...remover.filterRemovals(a.keywords.minor)];
    const aPatch = [...remover.filterRemovals(a.keywords.patch)];
    try {
        return {
            keywords: {
                major: [...aMajor, ...bMajor],
                minor: [...aMinor, ...bMinor],
                patch: [...aPatch, ...bPatch],
            },
        };
    } catch (e) {
        throw new InvalidGitBumpConfigsError(`git-configs e.message`)
    }
}

class DuplicationRemover<T> {
    _excludeSet = new Set<T>();

    filterRemovals(list: T[]): T[] {
        const ret: T[] = [];
        for (const e of list) {
            if (!this._excludeSet.has(e)) {
                this._excludeSet.add(e);
                ret.push(e);
            }
        }
        return ret;
    }
}

const EMPTY_RELEASE_TYPE_KEYWORD_MAP: ReleaseTypeKeywordMap = {
    major: [],
    minor: [],
    patch: [],
}

// visible for testing
export const EMPTY_CONFIG: GitBumpConfig = {
    keywords: EMPTY_RELEASE_TYPE_KEYWORD_MAP
};

// visible for testing
export function makeValidGitBumpConfig(arg: any): GitBumpConfig {
    if (arg === null || arg === undefined) {
        return EMPTY_CONFIG;
    }
    if (typeof arg !== 'object') {
        throw new InvalidGitBumpConfigsError(`Invalid Object on git-bump config: ${arg}`);
    }
    return {
        keywords: makeValidReleaseTypeMap(arg['keywords']),
    };
}

function makeValidReleaseTypeMap(arg: any): ReleaseTypeKeywordMap {
    if (arg === null || arg === undefined) {
        return EMPTY_RELEASE_TYPE_KEYWORD_MAP;
    }
    if (typeof arg !== 'object') {
        throw new InvalidGitBumpConfigsError(`Invalid Object on 'keywords': ${arg}`);
    }
    const major = makeValidStringArray(arg['major']);
    if (major === null) {
        throw new InvalidGitBumpConfigsError(`Invalid StringArray on 'keywords.major': ${arg}`);
    }
    const minor = makeValidStringArray(arg['minor']);
    if (minor === null) {
        throw new InvalidGitBumpConfigsError(`Invalid StringArray on 'keywords.major': ${arg}`);
    }
    const patch = makeValidStringArray(arg['patch']);
    if (patch === null) {
        throw new InvalidGitBumpConfigsError(`Invalid StringArray on 'keywords.major': ${arg}`);
    }
    return {major, minor, patch};
}

function makeValidStringArray(arg: any): string[] | null {
    if (arg === null || arg === undefined) {
        return [];
    }
    const isStringArray = Array.isArray(arg) && arg.every(e => typeof e === 'string' || e instanceof String);
    return isStringArray ? arg : null;
}
