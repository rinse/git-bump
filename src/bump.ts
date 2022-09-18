import {PrereleaseType, ReleaseType} from "./ReleaseType";
import semver from "semver";
import {SemanticVersion} from "./SemanticVersion";

export function bumpVersion(previousVersion: SemanticVersion, releaseType: ReleaseType): SemanticVersion {
    const newVersion = semver.inc(previousVersion.get(), releaseType);
    if (newVersion === null) {
        throw new Error("Failed to bump. The current version may not be a valid semver.");
    }
    return new SemanticVersion(newVersion);
}

export function bumpPrereleaseVersion(previousVersion: SemanticVersion, prereleaseType?: PrereleaseType, prerelease?: string): SemanticVersion {
    const newVersion = semver.inc(previousVersion.get(), prereleaseType ?? "prerelease", prerelease);
    if (newVersion === null) {
        throw new Error("Failed to bump. The current version may not be a valid semver.");
    }
    return new SemanticVersion(newVersion);
}
