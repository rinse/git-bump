export type ReleaseType = "patch" | "minor" | "major";

export function precedenceOfReleaseType(a: ReleaseType): number {
    switch (a) {
        case "patch": return 0;
        case "minor": return 1;
        case "major": return 2;
    }
}

export type PrereleaseType = "prepatch" | "preminor" | "premajor" | "prerelease";

export function toPrerelease(a: ReleaseType): PrereleaseType {
    switch (a) {
        case "patch": return "prepatch";
        case "minor": return "preminor";
        case "major": return "premajor";
    }
}
