function isDebugging() {
    let url = document.URL;
    let index = url.indexOf("#");
    if (index !== -1) {
        return url.substring(index + 1).split("#").filter(s => s === "debug").length > 0;
    }
    return false;
}

export const DEBUGGING = isDebugging();
