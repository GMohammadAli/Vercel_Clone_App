import express from "express";
import { S3 } from "aws-sdk";
import { createClient } from "redis";

const app = express();

const subscriber = createClient();
subscriber.connect();

// replace with your own credentials
const s3 = new S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    endpoint: process.env.ENDPOINT
})

app.get("/*", async (req, res) => {
    //projectId.ali-vercel.com
    const host = req.hostname;
    const id = host.split(".")[0];
    const filePath = req.path;

    const contents = await s3.getObject({
        Bucket: "vercel",
        Key: `dist/${id}${filePath}`
    }).promise();

    console.log({id: id, host: host, filePath: filePath})

    const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript"
    res.set("Content-Type", type);

    res.send(contents.Body);
})

app.get("/status", async (req, res) => {
    //projectId.ali-vercel.com
    const projectId = req.query.id;
    const status = await subscriber.hGet("redis-project-status",projectId as string)

    return res.json({
        status: status
    })
    
})

app.listen(3002);