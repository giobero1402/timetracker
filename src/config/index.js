import dotenv from "dotenv";
dotenv.config();
const config = {
    port: process.env.PORT,
    version: process.env.VERSION,
    project: process.env.PROJECT,
    spreadsheet_id: process.env.SPREADSHEET_ID,
    private_key: process.env.PRIVATE_KEY,
}

export default config