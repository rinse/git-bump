import semver, {SemVer} from "semver";
import {precedenceOfReleaseType, ReleaseType, toPrerelease} from "./ReleaseType";
import {
    extractKeyword,
    getKeywordRegex,
    KeywordReleaseTypeMap,
    keywordToReleaseType,
    readKeywordReleaseTypeMap
} from "./keywords";
import {readExactVersion, readGitHash, readGitLog, readPreviousVersion} from "./gits";
import {liftToNonNullList, maxOn, minOn, run} from "./utils";
import {bumpPrereleaseVersion, bumpVersion} from "./bump";
import {SemanticVersion, setBuildMetadata} from "./SemanticVersion";

export type Options = {
    release: boolean,
    prerelease?: string,
    build: boolean,
    initialVersion: string,
    includeNonAnnotatedTags: boolean,
    verbose: boolean,
};

export function assumeVersion(options: Options): SemanticVersion {
    return assumeVersionPure(options, {
        readExactVersion: () => readExactVersion(options.includeNonAnnotatedTags, options.verbose),
        readPreviousVersion: () => readPreviousVersion(options.includeNonAnnotatedTags, options.verbose),
        readGitLog: readGitLog,
        readKeywordReleaseTypeMap: readKeywordReleaseTypeMap,
        readBuildMetadata: readGitHash,
    });
}

type Dependencies = {
    readExactVersion: () => SemanticVersion | null,
    readPreviousVersion: () => SemanticVersion | null,
    readGitLog: (previousVersion: SemanticVersion) => string[],
    readKeywordReleaseTypeMap: () => KeywordReleaseTypeMap,
    readBuildMetadata: () => string,
}

/**
 * Assume a current version.
 *
 * 1. If the exact version is found on HEAD, it returns the version without assumption.
 * 2. It assumes a current version based on the previous version and the commit log
 *    if the exact version is not found on HEAD.
 * 3. A release version is assumed if the previous version is a release version.
 * 4. A prerelease version is assumed if the previous version is a prerelease version.
 *
 * @remarks
 * With the 'release' option, an assumed version will be a release version
 * even if the previous version is a prerelease version.
 * Also, a new release version is assumed even if an exact prerelease version is found.
 * With the 'prerelease' option, an assumed version will be a prerelease version
 * even if the previous version is a release version.
 * With the 'build' options, a build metadata is added to an assumed version.
 * Note a returned version may not have a build metadata,
 * in case the exact version found and it doesn't have a build metadata.
 *
 * @param options Optional parameters.
 * @param dependencies Dependencies to be injected.
 * @returns An assumed verified semantic version.
 */
export function assumeVersionPure(options: Options, dependencies: Dependencies): SemanticVersion {
    const buildMetadata = options.build ? dependencies.readBuildMetadata() : "";
    const exactVersion = dependencies.readExactVersion();
    if (exactVersion !== null) {
        // An exact version is available.
        const svExactVersion = new SemVer(exactVersion.get());
        const prerelease = svExactVersion.prerelease;
        if (prerelease.length === 0 || !options.release) {
            // Returns the current version.
            return exactVersion;
        }
        // Returns the release version of the current prerelease version.
        const partialVersion = new SemanticVersion(svExactVersion.inc("patch").version);
        return options.build ? setBuildMetadata(partialVersion, buildMetadata) : partialVersion;
    }
    const previousVersion = dependencies.readPreviousVersion();
    if (previousVersion === null) {
        // No versions are tagged ever.
        const initialVersion = semver.valid(options.initialVersion);
        if (initialVersion === null) {
            throw new Error("The given initial version does not a valid semver.");
        }
        const partialVersion = new SemanticVersion(initialVersion);
        return options.build ? setBuildMetadata(partialVersion, buildMetadata) : partialVersion;
    }
    // Assume a current version from the commits.
    const keywords = dependencies.readKeywordReleaseTypeMap();
    const gitLog = dependencies.readGitLog(previousVersion);
    const svPreviousVersion = new SemVer(previousVersion.get());
    const releaseType = run(() => {
        const releaseType = assumeReleaseType(keywords, gitLog);
        return svPreviousVersion.major !== 0
            ? releaseType
            : minOn(precedenceOfReleaseType)(releaseType, "minor");
    });
    const previousPrerelease = svPreviousVersion.prerelease;
    const prerelease = options?.prerelease;
    if (!options.release && prerelease !== undefined) {
        // A prerelease identifier is given.
        const p = previousPrerelease.length !== 0 ? "prerelease" : toPrerelease(releaseType);
        const partialVersion = bumpPrereleaseVersion(previousVersion, p, options.prerelease);
        return options.build ? setBuildMetadata(partialVersion, buildMetadata) : partialVersion;
    }
    if (!options.release && previousPrerelease.length !== 0) {
        // Assume a prerelease identifier if the previous version is a prerelease version.
        const partialVersion = bumpPrereleaseVersion(previousVersion);
        return options.build ? setBuildMetadata(partialVersion, buildMetadata) : partialVersion;
    }
    const partialVersion = bumpVersion(previousVersion, releaseType);
    return options.build ? setBuildMetadata(partialVersion, buildMetadata) : partialVersion;
}

function assumeReleaseType(keywords: KeywordReleaseTypeMap, linesOfGitLog: string[]): ReleaseType {
    const keywordRegex = getKeywordRegex(keywords)
    return linesOfGitLog.map(line => extractKeyword(line, keywordRegex))
        .flatMap(liftToNonNullList)
        .map(keyword => keywordToReleaseType(keyword, keywords))
        .reduce(maxOn(r => precedenceOfReleaseType(r)), "patch");
}
