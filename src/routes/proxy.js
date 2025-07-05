import {createProxyMiddleware} from "http-proxy-middleware";
import config from "../config/index.js";

export default function proxy(app){
    app.use('/proxy', createProxyMiddleware({
        target: config.crm_url,
        changeOrigin: true,
        pathRewrite: {
            '^/proxy': '',
        },
        onProxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('Authorization', `Token ${config.crm_api_key}`);
        }
    }), )
}