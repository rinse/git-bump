import semver from "semver";

/**
 * A verified semantic version.
 */
export class SemanticVersion {
    readonly #semver: string

    /**
     * @param semanticVersion
     * @throws Error if the given semantic version is not valid.
     */
    constructor(semanticVersion: string) {
        checkValid(semanticVersion, `${semanticVersion} is not a valid semver.`)
        this.#semver = semanticVersion;
    }

    get(): string {
        return this.#semver;
    }
}

/**
 * @param semanticVersion A semantic version to be based on.
 * @param buildMetadata A build metadata to be added to the semantic version.
 * @returns A verified semantic version.
 * @throws Error if the build metadata is invalid.
 */
export function setBuildMetadata(semanticVersion: SemanticVersion, buildMetadata: string): SemanticVersion {
    const version = semanticVersion.get();
    const index = version.indexOf("+");
    const partialVersion = index !== -1
        ? version.substring(0, index)
        : version;
    const newVersion = `${partialVersion}+${buildMetadata}`;
    checkValid(newVersion,
        `${newVersion} is not a valid semver. Verify ${buildMetadata} are valid prerelease identifiers.`)
    return new SemanticVersion(newVersion);
}

function checkValid(semanticVersion: string, message: string) {
    const temp = semver.valid(semanticVersion, {loose: false});
    if (temp === null) {
        throw new Error(message);
    }
}
