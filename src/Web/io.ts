export namespace IOUtils {
    /**
     * Saves a value to the user's machine as a JSON file.
     *
     * Serialises the value, hands the browser a temporary link and clicks it. Anything
     * `JSON.stringify` cannot represent — functions, `undefined`, circular references —
     * is dropped or throws, exactly as it would anywhere else.
     *
     * Browser only. The temporary link is cleaned up straight afterwards.
     *
     * @param filename The name to suggest in the save dialog. Include the `.json`
     * extension yourself; nothing is appended.
     * @param content The value to save.
     */
    export const downloadJson = (filename: string, content: object) => {
        const blob = new Blob([JSON.stringify(content)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");

        downloadLink.download = filename;
        downloadLink.href = url;
        downloadLink.click();

        // Without this the blob is pinned in memory for the lifetime of the page.
        URL.revokeObjectURL(url);
    };
}
