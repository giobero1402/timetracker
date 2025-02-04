import express from 'express';
import config from "./config/index.js";
import routerApi from "./routes/index.js";
import cors from "cors";

const port = config.port

const app = express()

app.use(express.json())
app.use(cors())

routerApi(app)

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})