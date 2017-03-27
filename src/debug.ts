function isDebugging() {
    return isDebuggingWithSep("#") || isDebuggingWithSep("?");
}

function isDebuggingWithSep(sep: string) {
    let url = document.URL;
    let index = url.indexOf(sep);
    if (index !== -1) {
        return url.substring(index + 1).split(sep).filter(s => s === "debug").length > 0;
    }
    return false;
}

export const DEBUGGING = isDebugging();
