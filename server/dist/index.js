"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserWallet = exports.fetchVendingToken = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const body_parser_1 = __importDefault(require("body-parser"));
const https_1 = __importDefault(require("https"));
const app = (0, express_1.default)();
const router = express_1.default.Router();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
const port = process.env.PORT || 18012;
const apiKey = "V9yKoxl5EljDbawloXWHaD2zgclp28U9f5YSY3U3";
const agentWallet = "0x0bd3e40f8410ea473850db5479348f074d254ded";
const agentPin = "1234";
const merchantAddress = "0x6376d76009ba9ed381011134efae927b3f5cbd0f";
const merchantpwd = "1234";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const generateVendingHash = () => {
    return crypto_1.default.randomBytes(8).toString("hex");
};
const fetchVendingToken = async (_req, res) => {
    const vendingHash = generateVendingHash();
    console.log(vendingHash);
    const url = "https://api.espees.org/agents/vending/createtoken";
    const options = {
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
        },
        body: {
            vending_wallet_address: agentWallet,
            vending_wallet_pin: agentPin,
            vending_hash: vendingHash,
        },
    };
    try {
        const response = await axios_1.default.post(url, options.body, {
            headers: options.headers,
        });
        const data = response.data;
        console.log("Success response:", data);
        res.status(200).json(response.data);
        return data;
    }
    catch (err) {
        console.error("Error:", err);
        res.status(500).json({ msg: `Internal Server Error.` });
    }
};
exports.fetchVendingToken = fetchVendingToken;
router.post(`/fetchVendingToken`, exports.fetchVendingToken);
const fetchUserWallet = async (req, res) => {
    const { username } = req.body;
    console.log("fetchUserWallet request", username);
    const url = "https://api.espees.org/user/address";
    const options = {
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
        },
        body: {
            username: username,
        },
    };
    try {
        const response = await axios_1.default.post(url, options.body, {
            headers: options.headers,
        });
        const data = response.data;
        console.log("Success response:", data);
        res.status(200).json(response.data);
        return data;
    }
    catch (err) {
        console.error("Error:", err);
        res.status(500).json({ msg: `Internal Server Error.` });
    }
};
exports.fetchUserWallet = fetchUserWallet;
router.post(`/fetchUserWallet`, exports.fetchUserWallet);
router.post(`/handleVendEspees`, async function (req, res) {
    console.log("Received request:", req.body);
    try {
        const { vendingToken, userWalletAddress, vendingAmount } = req.body;
        const response = await fetch("https://api.espees.org/v2/vending/vend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
            },
            body: JSON.stringify({
                vending_token: vendingToken,
                user_wallet: userWalletAddress,
                amount_in_espees: vendingAmount,
            }),
        });
        if (!response.ok) {
            throw new Error("Failed to vend Espees");
        }
        const data = await response.json();
        console.log("Success response:", data);
        return res.status(200).json(data);
    }
    catch (error) {
        console.error("Error:", error);
        return res.sendStatus(400);
    }
});
router.post("/registerProduct", async (req, res) => {
    console.log("Received payment request:", req.body);
    const httpsAgent = new axios_1.default.create({
        httpsAgent: new https_1.default.Agent({
            rejectUnauthorized: false,
        }),
    });
    const url = "https://restapi.connectw.com/api/payment";
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            admin: merchantAddress,
            adminpwd: merchantpwd,
        },
        body: JSON.stringify({
            op: "recordproduct",
            params: [
                { name: "productid", value: "001" },
                { name: "productname", value: "ESPEES" },
                { name: "description", value: "This is a payment for ESPEES." },
                {
                    name: "productimage",
                    value: "https://lwappstore.com/developers/uploads/espeesCoinOption5.png",
                },
            ],
        }),
    };
    try {
        const response = await httpsAgent.post(url, options.body, {
            headers: options.headers,
        });
        console.log("Response from API:", response.data);
        const data = response.data;
        res.status(200).json(response.data);
        return data;
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal Server Error." });
    }
});
router.post("/initiatepayment", async (req, res) => {
    console.log("Received payment initialization request:", req.body);
    const { wallet, currency, amount, payername, } = req.body;
    const merchantAddress = req.query.merchantAddress;
    const merchantpwd = req.query.merchantpwd;
    if (!merchantAddress || !merchantpwd) {
        return res.status(400).json({ msg: "Merchant address and password are required." });
    }
    const paymentType = currency === "USD" ? "card" : currency === "NGN" ? "bank" : "default";
    const url = "https://restapi.connectw.com/api/payment";
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            admin: merchantAddress,
            adminpwd: merchantpwd,
        },
        body: JSON.stringify({
            op: "paymentinitialize",
            params: [
                { name: "address", value: wallet },
                { name: "token", value: "101" },
                { name: "currency", value: currency },
                { name: "amount", value: amount },
                { name: "success_url", value: "https://espees.vercel.app/buy/success" },
                { name: "cancel_url", value: "https://espees.vercel.app/buy/cancel" },
                { name: "paymenttype", value: paymentType },
                { name: "passthrough", value: "0" },
                { name: "commissionrate", value: "0" },
                { name: "exchange", value: "1" },
                { name: "payername", value: payername },
                { name: "payerzipcode", value: "null" },
                { name: "reusewallet", value: "1" },
            ],
        }),
    };
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Response from API:", data);
        return res.status(200).json({ data, message: "Payment initiated successfully" });
    }
    catch (error) {
        console.error("Error initiating payment:", error);
        return res.status(500).json({ error: "Failed to initiate payment" });
    }
});
router.post("/getProject", async (req, res) => {
    console.log("Received get project request:", req.body);
    const url = "https://restapi.connectw.com/api/payment";
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            admin: merchantAddress,
            adminpwd: merchantpwd,
        },
        body: JSON.stringify({
            op: "getproject",
            params: [{ name: "getbalances", value: "true" }],
        }),
    };
    try {
        const response = await axios_1.default.post(url, options.body, {
            headers: options.headers,
        });
        console.log("Response from API:", response.data);
        res.status(200).json(response.data);
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal Server Error." });
    }
});
router.post("/recordTransaction", async (req, res) => {
    console.log("Received record payment request:", req.body);
    const url = "https://restapi.connectw.com/api/payment";
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            admin: merchantAddress,
            adminpwd: merchantpwd,
        },
        body: JSON.stringify({
            op: "recordpayment",
            params: [
                { name: "currency", value: req.body.currency || "USD" },
                { name: "txid", value: req.body.txid },
                { name: "checkouttype", value: "paymentintent" },
            ],
        }),
    };
    try {
        const response = await axios_1.default.post(url, options.body, {
            headers: options.headers,
        });
        console.log("Response from API:", response.data);
        res.status(200).json(response.data);
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal Server Error." });
    }
});
router.post("/createSubMerchant", async (req, res) => {
    const { merchantAddr, merchantname, description } = req.body;
    const url = "https://restapi.connectw.com/api/payment";
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            admin: merchantAddress,
            adminpwd: merchantpwd,
        },
        body: JSON.stringify({
            op: "recordmerchant",
            params: [
                { name: "merchantaddress", value: merchantAddr },
                { name: "merchantname", value: merchantname },
                { name: "description", value: description },
                {
                    name: "merchantimage",
                    value: "https://lwappstore.com/developers/uploads/espeesCoinOption5.png",
                },
                { name: "cancreatevirtualcards", value: "0" },
                { name: "maxtxn", value: "500" },
                { name: "mintxn", value: "1" },
                { name: "minbal", value: "1" },
            ],
        }),
    };
    try {
        const response = await axios_1.default.post(url, options.body, { headers: options.headers });
        console.log("Response from API:", response.data);
        res.status(200).json(response.data);
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal Server Error." });
    }
});
router.post("/updateSubMerchant", async (res) => {
    const url = "https://restapi.connectw.com/api/payment";
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            admin: merchantAddress,
            adminpwd: merchantpwd,
        },
        body: JSON.stringify({
            op: "updatemerchant",
            params: [
                { name: "merchantaddress", value: "0xc43da1792d94d443dfe6de07563f11c287d828cd" },
                { name: "merchantname", value: "Test Merchant" },
                { name: "description", value: "This is a test project for Toros." },
                { name: "merchantimage", value: "https://toronet.org/explorer/images/toro-logo.png" },
                { name: "cancreatevirtualcards", value: "0" },
                { name: "maxtxn", value: "500" },
                { name: "mintxn", value: "1" },
                { name: "minbal", value: "1" },
            ],
        }),
    };
    try {
        const response = await axios_1.default.post(url, options.body, { headers: options.headers });
        console.log("Response from API:", response.data);
        res.status(200).json(response.data);
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal Server Error." });
    }
});
router.post("/viewSubMerchant", async (req, res) => {
    const { merchantAddress } = req.body;
    const url = "https://restapi.connectw.com/api/payment";
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            admin: merchantAddress,
            adminpwd: merchantpwd,
        },
        body: JSON.stringify({
            op: "getmerchant",
            params: [{ name: "merchantaddress", value: merchantAddress }],
        }),
    };
    try {
        const response = await axios_1.default.post(url, options.body, { headers: options.headers });
        console.log("Response from API:", response.data);
        res.status(200).json(response.data);
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal Server Error." });
    }
});
app.use(express_1.default.json());
app.use(router);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:18012`);
});
//# sourceMappingURL=index.js.map