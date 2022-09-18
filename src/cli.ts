import yargs from "yargs/yargs";

export const commandLineOptions = yargs(process.argv.slice(2))
    .usage("$0 assumes the current version from Git tag and Git log.")
    .locale("en")
    .options({
        "release": {
            default: false,
            type: "boolean",
            desc: "Always display a release version. Even if HEAD is tagged with a prerelease version, "
                + "a release version is newly suggested.",
        },
        "prerelease": {
            default: undefined,
            type: "string",
            desc: "Add a prerelease to an assumed version. Ignored when an exact version found.",
        },
        "build": {
            default: false,
            type: "boolean",
            desc: "An assumed version will have a build metadata. Ignored when an exact version found.",
        },
        "initial-version": {
            default: "0.1.0",
            type: "string",
            desc: "The initial version when no previous version found.",
        },
        "include-non-annotated": {
            alias: "i",
            default: false,
            type: "boolean",
            desc: "Include non-annotated tags in previous-version searching.",
        },
        "verbose": {
            alias: "v",
            default: false,
            type: "boolean",
            desc: "Output more verbose messages.",
        },
    })
    .help()
    .strict()
    .parseSync()
