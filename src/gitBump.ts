import { spawnSync } from "child_process";
import semver from "semver";
import { Logger } from "./Logger";

const ReleaseType = {
    Patch: { label: "patch", id: 0 },
    Minor: { label: "minor", id: 1 },
    Major: { label: "major", id: 2 },
} as const;

type valueOf<T> = T[keyof T];

type ReleaseType = valueOf<typeof ReleaseType>;

const Keywords = {
    // Closing keywords of GitHub and GitLab
    "fix": ReleaseType.Patch,
    "fix!": ReleaseType.Major,
    "fixes": ReleaseType.Patch,
    "fixes!": ReleaseType.Major,
    "fixed": ReleaseType.Patch,
    "fixed!": ReleaseType.Major,
    "fixing": ReleaseType.Patch,
    "fixing!": ReleaseType.Major,
    "resolve": ReleaseType.Minor,
    "resolve!": ReleaseType.Major,
    "resolves": ReleaseType.Minor,
    "resolves!": ReleaseType.Major,
    "resolved": ReleaseType.Minor,
    "resolved!": ReleaseType.Major,
    "resolving": ReleaseType.Minor,
    "resolving!": ReleaseType.Major,
    "close": ReleaseType.Minor,
    "close!": ReleaseType.Major,
    "closes": ReleaseType.Minor,
    "closes!": ReleaseType.Major,
    "closed": ReleaseType.Minor,
    "closed!": ReleaseType.Major,
    "closing": ReleaseType.Minor,
    "closing!": ReleaseType.Major,
    // My favorite keywords
    "hotfix": ReleaseType.Patch,
    "hotfix!": ReleaseType.Major,
    "feat": ReleaseType.Minor,
    "feat!": ReleaseType.Major,
    "feature": ReleaseType.Minor,
    "feature!": ReleaseType.Major,
    "refactor": ReleaseType.Minor,
    "refactor!": ReleaseType.Major,
    "refactors": ReleaseType.Minor,
    "refactors!": ReleaseType.Major,
    "refactoring": ReleaseType.Minor,
    "refactoring!": ReleaseType.Major,
} as const;

const keywordRegex = run(() => {
    // Keywords may also be loaded from an external file.
    // The longest keyword comes to head.
    const keywords = Object.keys(Keywords).sort((a, b) => b.length - a.length);
    const regex = keywords.reduce((acc, a) => `${acc}|${a}`);
    return new RegExp(regex);
});

function maxOn<T, U>(mapper: (t: T) => U): (a: T, b: T) => T {
    return (a, b) => mapper(a) > mapper(b) ? a : b;
}

export type Options = {
    includeNonAnnotatedTags: boolean,
    verbose: boolean,
    build: boolean,
    prerelease?: string,
};

const INITIAL_PREVIOUS_VERSION = "0.0.0";

export function assumeVersion(options: Options): string {
    const logger = new Logger(options.verbose);
    const exactVersion = readExactVersion(options.includeNonAnnotatedTags);
    if (exactVersion !== null) {
        // If the application has the exact version, return it.
        logger.debug(`The exact version found: ${exactVersion}`);
        return exactVersion;
    }
    // Assume a current version from the previous version and Git log.
    const previousVersion = readPreviousVersion(options.includeNonAnnotatedTags);
    logger.debug(`The previous version: ${previousVersion}`);
    const versionCore = run(() => {
        if (options.prerelease !== undefined) {
            return bumpPrerelease(previousVersion ?? INITIAL_PREVIOUS_VERSION, options.prerelease);
        } else if (previousVersion === null) {
            return bumpVersion(INITIAL_PREVIOUS_VERSION, ReleaseType.Patch);
        } else {
            const gitLog = readGitLog(previousVersion);
            const releaseType = assumeReleaseType(gitLog);
            logger.debug(`Assumed release type: ${releaseType.label}`);
            return bumpVersion(previousVersion, releaseType);
        }
    });
    const build = options.build ? `+${readGitHash()}` : "";
    return `${versionCore}${build}`;
}

function run<T>(f: () => T): T {
    return f();
}

function readExactVersion(includeNonAnnotatedTag: boolean): string | null {
    const { stdout, status } = spawnSync("git", ["describe", "--exact-match"].concat(includeNonAnnotatedTag ? ["--tags"] : []));
    if (status !== 0) {
        return null;
    }
    const tag = stdout.toString("utf8").trim();
    const version = semver.valid(tag);
    if (version === null) {
        throw new Error(`The current version is not a valid semver: ${tag}.`);
    }
    return version;
}

function readPreviousVersion(includeNonAnnotatedTag: boolean): string | null {
    const { stdout, status } = spawnSync("git", ["describe", "--abbrev=0"].concat(includeNonAnnotatedTag ? ["--tags"] : []));
    if (status !== 0) {
        return null;
    }
    const tag = stdout.toString("utf8").trim();
    const version = semver.valid(tag);
    if (version === null) {
        throw new Error(`The previous version is not a valid semver: ${tag}.`);
    }
    return version;
}

function bumpPrerelease(previousVersion: string, prerelease: string): string {
    const newVersion = semver.inc(previousVersion, "prerelease", prerelease);
    if (newVersion === null) {
        throw new Error("Failed to bump. The current version may not be a valid semver.");
    }
    return newVersion;
}

function readGitLog(previousVersion: string): string[] {
    const { stdout, status } = spawnSync("git", ["log", `refs/tags/${previousVersion}..HEAD`]);
    if (status !== 0) {
        throw new Error("Failed to run Git log. Make sure Git is installed and you're in a project directory.");
    }
    return stdout.toString("utf8").trim()
        .split(/(?:\r\n|\r|\n)/g).map(line => line.trim());
}

function assumeReleaseType(linesOfGitLog: string[]): ReleaseType {
    return linesOfGitLog.map(extractKeyword)
        .flatMap(liftToNonNullList)
        .map(keywordToReleaseType)
        .reduce(maxOn(r => r.id), ReleaseType.Patch);
}

function extractKeyword(line: string): string | null {
    const result = line.match(keywordRegex);
    if (result === null || result.length === 0) {
        return null;
    }
    return result[0];
}

function liftToNonNullList<T>(t: T | null): T[] {
    return t !== null ? [t] : [];
}

function keywordToReleaseType(keyword: string): ReleaseType {
    const keywords: { [key: string]: ReleaseType } = Keywords;
    const ret = keywords[keyword];
    if (ret === undefined) {
        throw new Error(`No such keyword ${keyword} is registered.`);
    }
    return ret;
}

function bumpVersion(previousVersion: string, releaseType: ReleaseType): string {
    const newVersion = semver.inc(previousVersion, releaseType.label);
    if (newVersion === null) {
        throw new Error("Failed to bump. The current version may not be a valid semver.");
    }
    return newVersion;
}

function readGitHash(): string {
    const { stdout, status } = spawnSync("git", ["log", "-n", "1", "--format=%h"]);
    if (status !== 0) {
        throw new Error("Failed to run Git log. Make sure Git is installed and you're in a project directory.");
    }
    return stdout.toString("utf8").trim();
}
