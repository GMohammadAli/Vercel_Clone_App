import { exec } from "child_process"
import path from "path"

export const buildProject = async (projectID: string) => {
    console.log({projectID: projectID})
    return new Promise((resolve) => {
        const child = exec(`cd ${path.join(__dirname, `ouput/${projectID}`)} && npm install && npm run build`);

        //console for build logs and errors 
        child.stdout?.on("data", function(data) {
            console.log('stdout: ' + data);
        });

        child.stderr?.on("data", function(data) {
            console.log('stderr: ' + data);
        });

        child.on('close', function (code) {
            resolve(true);
        });
    })
}