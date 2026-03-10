export namespace IOUtils {
    export const download = (filename: string, content: object) => {
        const textToSave = JSON.stringify(content);
        const textToSaveAsBlob = new Blob([textToSave], { type: "text/json" });
        const textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
        const downloadLink = document.createElement("a");

        downloadLink.download = filename;
        downloadLink.href = textToSaveAsURL;
        downloadLink.click();
    };
}
