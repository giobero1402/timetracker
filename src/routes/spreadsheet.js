import express from "express";
import {google} from "googleapis";
import {GoogleAuth} from "google-auth-library";
import config from "../config/index.js";

const router = express.Router();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const PRIVATE_KEY = config.private_key

const auth = new GoogleAuth({
    keyFile: PRIVATE_KEY,
    scopes: SCOPES,
});

console.log("PRIVATE KEY:",PRIVATE_KEY)

/*
{
    job_id: ''
    employee: 'Giovanny Bernal',
    customer: '',
    omw: new Date(),
    start: new Date(),
    stop: new Date(),
}
*/

router.post("/save", async (req, res) => {
    const {job_id, employee, customer, start, stop, date} = req.body;
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = config.spreadsheet_id;
    const range = `Jobs!A1:Z1000`;
    const sheet = await sheets.spreadsheets.get({
        spreadsheetId
    })
    const sheetExists = sheet.data.sheets.some(
        (sheet) => sheet.properties.title === 'Jobs'
    );
    if(!sheetExists) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: 'Jobs',
                            }
                        }
                    }
                ]
            }
        })
        const init = [["Job Id", "Employee", "Customer", "Start", "Stop", "Date", "Total"]]
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            requestBody: { values:init },
        });
    }
    const abs = Math.abs(new Date(start) - new Date(stop));
    const total = abs / (1000 * 60 * 60)
    console.log("Total", total)
    const values = [[job_id, employee, customer, start, stop, date, total]];
    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range
    })
    const rows = getResponse.data.values;
    let lastRow = rows ? rows.length+1 :1;
    if (rows) {
        for (let i = 0; i < rows.length; i++) {
            if (rows[i][0] === job_id) { // Assuming ID is in the first column
                lastRow = i+1;
                break;
            }
        }
    }
    const appendRange = `Jobs!A${lastRow}:Z${lastRow}`
    const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: appendRange,
        valueInputOption: 'RAW',
        requestBody: { values },
    });

    console.log('Updated cells:', response.data.updatedCells);

    res.status(200).send({message: 'done'})


})

router.post("/test", async (req, res) => {

    const {employee, start, stop} = req.body;
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = config.spreadsheet_id;
    const range = `${employee}!A1:Z1000`;
    const today = new Date();
    const date = today.toLocaleDateString();
    const sheet = await sheets.spreadsheets.get({
        spreadsheetId
    })
    const sheetExists = sheet.data.sheets.some(
        (sheet) => sheet.properties.title === employee
    );
    if(!sheetExists) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: employee,
                            }
                        }
                    }
                ]
            }
        })
        const init = [["Date", "Employee", "Start", "Stop", "Worked Time", "Total Jobs"]]
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            requestBody: { values:init },
        });
    }
    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range
    })
    const rows = getResponse.data.values;
    let lastRow = rows ? rows.length+1 :1;
    let readRow = []
    if (rows) {
        for (let i = 0; i < rows.length; i++) {
            if (rows[i][0] === date) { // Assuming ID is in the first column
                lastRow = i+1;
                readRow = rows[i]
                break;
            }
        }
    }
        const total = readRow[4] ? Number(readRow[4]) : 0;
    const jobs = () => {
        const totalJobs = readRow[5] ? Number(readRow[5]) : 0;
        if(!stop ){return totalJobs}
        return totalJobs+1
    }
    const workedTime = () => {
        if(!stop) {return total}
        const abs = Math.abs(new Date(start) - new Date(stop));
        return (abs / (1000 * 60 * 60)) + total
    }
    const values = [[date, employee, start, stop, workedTime(), jobs()]];
    const appendRange = `${employee}!A${lastRow}:Z${lastRow}`
    const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: appendRange,
        valueInputOption: 'RAW',
        requestBody: { values },
    });

    res.status(200).send({message: 'done'})


})

export default router;