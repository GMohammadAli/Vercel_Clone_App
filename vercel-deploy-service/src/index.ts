import { createClient, commandOptions } from "redis";
import { copyAndUploadFinalBuild, downloadS3Folder } from "./aws";
import { buildProject } from "./build";

const subscriber = createClient();
subscriber.connect();

const main = async () => {
    while(1) {
        const res = await subscriber.brPop(
            commandOptions({ isolated: true }),
            "redis-build-queue",
            0
        )
        // const responseInObjectFormat = JSON.parse(res);
        // console.log({response: responseInObjectFormat, type: typeof responseInObjectFormat})
        //shoudn;t do ts-ignore in production
        // @ts-ignore
        const projectID = res.element;
        //download the git (react) project from s3 bucket
        await downloadS3Folder(`output/${projectID}`);
        //build the git (react) project locally
        await buildProject(projectID);
        //upload the created build i.e dist folder to the s3 bucket
        copyAndUploadFinalBuild(projectID); 
    }
}

main();