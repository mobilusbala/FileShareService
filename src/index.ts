import express, { Request, Response } from "express";
import { UploadService } from "./upload-service";
import { UploadRequest } from "./req-types";
import { _dir, UPLOAD_API_ENV, TOKEN } from "./constants";
import cors from "cors";

const app = express();

//app.use(cors); /* NEW */

//app.use(express.json());

app.listen(4000, () => console.log("listening on port 4000"));

app.get("/", (req: Request, res: Response) => {
  return res.json({
    status: "success ",
    api: UPLOAD_API_ENV,
    key: TOKEN,
  });
});

app.get("/ready", async (req: Request, res: Response) => {
  try {
    const dirContents = await UploadService.getAllRecordings();
    const fileName = `${req.query.host}=${req.query.conversationId}=${req.query.userId}=${req.query.callId}=${req.query.callStartTime}`;
    const findfiles = await UploadService.findByName(dirContents, fileName);
    console.log(fileName);
    console.log(findfiles[0]);

    if (findfiles.length == 1) {
      const upReq = {
        host: req.query.host,
        userId: req.query.userId,
        fileName: findfiles[0],
      };

      const resUpload = await UploadService.uploadRecordings(
        req.query,
        findfiles[0]
      );

      res.send(resUpload);
    } else {
      await UploadService.writeToFile(
        `fileName ${fileName} is failed - Error Recording file not found. The count ${findfiles.length}`
      );
      res.send(`Recording file not found. The count ${findfiles.length}`);
    }
  } catch (error) {
    UploadService.writeToFile(
      `fileName ${req.query.host}=${req.query.userId}.wav is failed - Error ${error}`
    );
    res.send(error);
  }
});
