import axios from "axios";
import FormData from "form-data";
import * as fs from "fs";
import { _dir, TOKEN, UPLOAD_API_ENV } from "./constants";

const getAllRecordings = async () => {
  return fs.readdirSync(_dir);
};

const findByName = async (files: string[], fileName: string) => {
  const matchedFiles = [];

  for (const file of files) {
    if (file.startsWith(fileName) && file.endsWith(".wav")) {
      matchedFiles.push(file);
    }
  }

  return matchedFiles;
};

const deleteByName = async (fileName: string) => {
  fs.unlink(`${_dir}${fileName}`, (err) => {
    if (err) {
      console.log(`Delete File failed ${_dir}${fileName}`);
      writeToFile(`Delete File failed ${fileName}`);
    } else {
      console.log(`${_dir}${fileName} was deleted`); // or else the file will be deleted
    }
  });
};

const uploadRecordings = async (uploadRequest: any, fileName: string) => {
  console.log(uploadRequest);

  var data = new FormData();
  data.append("host", uploadRequest.host);
  data.append("userId", uploadRequest.userId);
  data.append("RecFile", fs.createReadStream(`${_dir}${fileName}`));

  var config = {
    method: "post",
    url: `${UPLOAD_API_ENV}/v2/upload`,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...data.getHeaders(),
    },
    data: data,
  };


  try {
    const res = await axios(config);
    const data = res.data;
    //console.log(data);
    deleteByName(`${fileName}`);
    return data;
  } catch (err: any) {
    if (err.response) {
      // ✅ log status code here
      console.log(err.response.status);
      console.log(err.message);
      console.log(err.response.headers); // 👉️ {... response headers here}
      console.log(err.response.data); // 👉️ {... response data here}
      return err.response.data;
    }
  }
};

const writeToFile = async (text: string) => {
  try {
    fs.appendFile(`${_dir}document.txt`, `\r\n ${text} \r\n`, function (err) {
      if (err) throw err;
      console.log("writeToFile done !!!!!!!!");
    });
  } catch (error) {
    console.log(`Error in writeToFile ${error}`);
  }
};

export const UploadService = {
  getAllRecordings,
  findByName,
  deleteByName,
  uploadRecordings,
  writeToFile,
};
