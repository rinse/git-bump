import {bumpPrereleaseVersion, bumpVersion} from "./bump";
import {SemanticVersion} from "./SemanticVersion";

describe("bumpVersion bumps a release version", () => {
    test("When the previous version is a release version.", () => {
        const prevVersion = new SemanticVersion("1.0.0");
        const actual = bumpVersion(prevVersion, "patch");
        expect(actual.get()).toBe("1.0.1");
    });
    const tests = test.each(["patch", "minor", "major"] as const)
    tests("When the previous version is a prerelease version. releaseType: %s", (releaseType) => {
        const prevVersion = new SemanticVersion("1.0.0-alpha.0");
        const actual = bumpVersion(prevVersion, releaseType);
        expect(actual.get()).toBe("1.0.0");
    });
});

describe("bumpPrereleaseVersion bumps a prerelease version", () => {
    test.each([
        ["prepatch", "1.0.1-alpha.0"],
        ["preminor", "1.1.0-alpha.0"],
        ["premajor", "2.0.0-alpha.0"],
        ["prerelease", "1.0.1-alpha.0"],
        [undefined, "1.0.1-alpha.0"],
    ] as const)("When the previous version is a release version. releaseType: %s", (releaseType, expected) => {
        const prevVersion = new SemanticVersion("1.0.0");
        const actual = bumpPrereleaseVersion(prevVersion, releaseType, "alpha");
        expect(actual.get()).toBe(expected);
    });
    test.each([
        ["prepatch",   "alpha", "1.0.1-alpha.0"],
        ["preminor",   "alpha", "1.1.0-alpha.0"],
        ["premajor",   "alpha", "2.0.0-alpha.0"],
        ["prerelease", "alpha", "1.0.0-alpha.1"],
        [undefined,    "alpha", "1.0.0-alpha.1"],
        ["prepatch",   "beta", "1.0.1-beta.0"],
        ["preminor",   "beta", "1.1.0-beta.0"],
        ["premajor",   "beta", "2.0.0-beta.0"],
        ["prerelease", "beta", "1.0.0-beta.0"],
        [undefined,    "beta", "1.0.0-beta.0"],
    ] as const)("When the previous version is a prerelease version. releaseType: %s", (releaseType, prerelease, expected) => {
        const prevVersion = new SemanticVersion("1.0.0-alpha.0");
        const actual = bumpPrereleaseVersion(prevVersion, releaseType, prerelease);
        expect(actual.get()).toBe(expected);
    });
});
