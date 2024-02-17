import express from "express";
import cors from "cors";
import { generateProjectId }  from "./utils/generate";
import path from "path";
import simpleGit from "simple-git";
import { generateFilesPath } from "./utils/getAllFilesPath";
import { uploadFile } from "./utils/uploadFile";
import { createClient } from "redis";

const app = express();
app.use(cors())
app.use(express.json());

const publisher = createClient();
publisher.connect();


//deploy endpoint --> Phase 1 -> upload service
app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const projectID = generateProjectId();
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${projectID}`));

    console.log({repoUrl: repoUrl, projectID: projectID})
    //put this to s3
    const files = generateFilesPath(path.join(__dirname, `output/${projectID}`));
    // console.log({files: files, dirname: __dirname});
    files.forEach(async file => {
        await uploadFile(file.slice(__dirname.length + 1), file);
        // file = E:\\Self_Study\\Web_Development\\vercel\\build\\output\\5mtn37l\\src\\App.js, slice= \\output\\5mtn37l\\src\\App.js
    })

    //using redisQueue i.e adding the id to redis queue for deployment service to access
    publisher.lPush("redis-build-queue", projectID);

    //implement sqs queue
    res.json({
        id: projectID
    });
});

app.listen(3000);