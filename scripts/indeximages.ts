const fs = require("fs");
fs.readdir("./src/images/icons", (err, files) => {
    const fileNames = files
        .map((file) => {
            if (file.includes("index")) {
                return;
            }
            return `export { default as ${file.split(".")[0] + "Icon"} } from "./${file}";`;
        })
        .filter((v) => v);

    fs.writeFile("./src/images/icons/index.ts", fileNames.join("\n"), () => {});
});

fs.readdir("./src/images", (err, files) => {
    const fileNames = files
        .map((file) => {
            if (file.includes("index") || file.includes("icons")) {
                return;
            }
            return `export { default as ${file.split(".")[0] + "Image"} } from "./${file}";`;
        })
        .filter((v) => v);

    fs.writeFile("./src/images/index.ts", fileNames.join("\n"), () => {});
});
