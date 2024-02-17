import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

// replace with your own credentials
const s3 = new S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    endpoint: process.env.ENDPOINT
})

export const downloadS3Folder = async (prefix: string) => {
    // console.log({prefix: prefix});
    //listing all the files from s3 bucket
    const allFiles = await s3.listObjectsV2({
        Bucket: "vercel",
        Prefix: prefix
    }).promise();

    const allPromises = allFiles.Contents?.map(async ({Key}) => {
        //promisifying this function to make sure all the files are copied asynchronously
        return new Promise(async (resolve) => {
            if(!Key){
                resolve(true);
                return;
            }

            const finalOutputPath = path.join(__dirname, Key);
            //copying the file 
            const outputFile = fs.createWriteStream(finalOutputPath);
            const dirname = path.dirname(finalOutputPath);
            //checks if dir exists else creates one
            if(!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname, { recursive: true });
            }
            //storing the copied file locally
            s3.getObject({
                Bucket: "vercel",
                Key
            }).createReadStream().pipe(outputFile).on("finish", () =>{
                resolve(true);
            })
        })
    }) || []

    console.log("awaiting, creating files in the root folder via downloading files from s3 bucket i.e copying and storing files locally!!");

    //make sure all promises are resolved properly
    await Promise.all(allPromises?.filter(x => x !== undefined));
}


export const copyAndUploadFinalBuild = (projectID: string) => {
    const folderPath = path.join(__dirname, `output/${projectID}/build`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file => {
        uploadFile(`build/${projectID}/` + file.slice(folderPath.length + 1), file);
    })
}

const getAllFiles = (folderPath: string) => {
    let response:string[] = [];
    const allFilesAndFolders = fs.readdirSync(folderPath);
    allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}

// fileName => output/12312/src/App.jsx
// filePath => /Users/harkiratsingh/vercel/dist/output/12312/src/App.jsx
const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName,
    }).promise();
    console.log(response);
}