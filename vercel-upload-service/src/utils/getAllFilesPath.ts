import fs from "fs";
import path from "path";

export const generateFilesPath = (folderPath: string) => {
    let response:string[] = [];
    const allFilesAndFolders = fs.readdirSync(folderPath);
    allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(generateFilesPath(fullFilePath))
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}