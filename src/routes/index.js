import express from "express";
import config from "../config/index.js";

import spreadsheetRouter from "./spreadsheet.js";
import emailAuth from "./emailAuth.js";

export default function routerApi(app){
    const router = express.Router();
    app.use(`/${config.project}/${config.version}`, router);
    router.use('/employee', spreadsheetRouter);
    router.use('/email', emailAuth);
}