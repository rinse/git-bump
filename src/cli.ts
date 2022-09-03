import yargs from "yargs/yargs";

export const commandLineOptions = yargs(process.argv.slice(2))
    .usage("$0 assumes the current version from Git tag and Git log.")
    .locale("en")
    .options({
        "include-non-annotated": {
            alias: "i",
            default: false,
            type: "boolean",
            desc: "Include non-annotated tags to assume a version.",
        },
        "verbose": {
            alias: "v",
            default: false,
            type: "boolean",
            desc: "Output more verbose messages.",
        },
        "build": {
            default: false,
            type: "boolean",
            desc: "Add the commit hash of HEAD to an assumed version. Ignored when an exact version found.",
        },
        "prerelease": {
            default: undefined,
            type: "string",
            desc: "Add a prerelease to an assumed version. Ignored when an exact version found.",
        },
    })
    .help()
    .strict()
    .parseSync()
    ;
