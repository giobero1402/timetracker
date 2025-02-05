import dotenv from "dotenv";
dotenv.config();
const config = {
    port: process.env.PORT,
    version: process.env.VERSION,
    project: process.env.PROJECT,
    spreadsheet_id: process.env.SPREADSHEET_ID,
    private_key: process.env.PRIVATE_KEY,
    crm_url: process.env.CRM_URL,
    crm_api_key: process.env.CRM_API_KEY,
}

export default config