import express from "express";
import {google} from "googleapis";
import {GoogleAuth} from "google-auth-library";
import config from "../config/index.js";
import nodemailer from "nodemailer";

const router = express.Router();

const authCodes = {}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
})

router.post('/send-code/:email', (req, res) => {
    const email = req.params.email;
    const authCode = Math.floor(100000 + Math.random() * 900000);

    authCodes[email] = authCode
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: 'You Authentication Code',
        html: `Your authentication code is: ${authCode}`,
    }

    console.log(authCode)

    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            return res.status(500).json({error: 'Failed to send code'});
        }
        res.status(200).json({message: 'Authentication code sent'});
    })
})

router.post('/verify', (req, res) => {
    const {email, code} = req.body;

    if(authCodes[email] && authCodes[email] == code) {
        delete authCodes[email];
        return res.status(200).json({message: 'Successfully verify code', email: email});
    }

    res.status(400).json({
        message: 'Invalid authentication code'

    });
})

export default router;