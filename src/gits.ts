import {spawnSync} from "child_process";
import semver from "semver";
import {SemanticVersion} from "./SemanticVersion";

export function readGitLog(previousVersion: SemanticVersion): string[] {
    const {stdout, status} = spawnSync("git", ["log", `refs/tags/${previousVersion.get()}..HEAD`]);
    if (status !== 0) {
        throw new Error("Failed to run Git log. Make sure Git is installed and you're in a project directory.");
    }
    return stdout.toString("utf8").trim()
        .split(/:\r\n|\r|\n/g).map(line => line.trim());
}

export function readGitHash(): string {
    const {stdout, status} = spawnSync("git", ["log", "-n", "1", "--format=%h"]);
    if (status !== 0) {
        throw new Error("Failed to run Git log. Make sure Git is installed and you're in a project directory.");
    }
    return stdout.toString("utf8").trim();
}

export function readExactVersion(includeNonAnnotatedTag: boolean): SemanticVersion | null {
    const {stdout, status} = spawnSync("git", [
        "describe", "--exact-match", "--match", "*.*.*",
    ].concat(includeNonAnnotatedTag ? ["--tags"] : []));
    if (status !== 0) {
        return null;
    }
    const tag = stdout.toString("utf8").trim();
    if (semver.valid(tag) === null) {
        const message = `The current version ${tag} is not a valid semver.`
            + "Consider putting a new tag which meets the Semantic Versioning requirements. See https://semver.org.";
        throw new Error(message);
    }
    return new SemanticVersion(tag);
}

export function readPreviousVersion(includeNonAnnotatedTag: boolean): SemanticVersion | null {
    const {stdout, status} = spawnSync("git", [
        "describe", "--match", "*.*.*", "--abbrev=0",
    ].concat(includeNonAnnotatedTag ? ["--tags"] : []));
    if (status !== 0) {
        return null;
    }
    const tag = stdout.toString("utf8").trim();
    if (semver.valid(tag) === null) {
        const message = `The previous version ${tag} is not a valid semver.`
            + "Consider putting a new tag which meets the Semantic Versioning requirements. See https://semver.org.";
        throw new Error(message);
    }
    return new SemanticVersion(tag);
}

export function gitTopLevelPath(): string {
    const {stdout, status} = spawnSync("git", ["rev-parse", "--show-toplevel"]);
    if (status !== 0) {
        throw new Error("Failed to get the top-level directory of the working tree. Make sure Git is installed and you're in a project directory.");
    }
    return stdout.toString("utf8").trim();
}
