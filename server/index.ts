import express, { Request, Response } from "express";
import cors from "cors";
import crypto from "crypto";
import axios from "axios";
import bodyParser from "body-parser";
import https from "https";

const app = express();
const router = express.Router();

app.use(bodyParser.json());

app.use(cors());
const port = process.env.PORT || 18012;

const apiKey: string = "V9yKoxl5EljDbawloXWHaD2zgclp28U9f5YSY3U3";
const agentWallet: string = "0x0bd3e40f8410ea473850db5479348f074d254ded";
const agentPin: string = "1234";
const merchantAddress: string = "0x6376d76009ba9ed381011134efae927b3f5cbd0f";
const merchantpwd: string = "1234";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const generateVendingHash = (): string => {
  return crypto.randomBytes(8).toString("hex");
};

export const fetchVendingToken = async (
  _req: Request,
  res: Response
): Promise<any> => {
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
    const response = await axios.post(url, options.body, {
      headers: options.headers,
    });
    const data = response.data;
    console.log("Success response:", data); // Log successful response
    res.status(200).json(response.data);
    return data;
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ msg: `Internal Server Error.` });
  }
};
router.post(`/fetchVendingToken`, fetchVendingToken);

export const fetchUserWallet = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { username } = req.body; // Extract username from request body

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
    const response = await axios.post(url, options.body, {
      headers: options.headers,
    });
    const data = response.data;
    console.log("Success response:", data); // Log successful response
    res.status(200).json(response.data);
    return data;
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ msg: `Internal Server Error.` });
  }
};
router.post(`/fetchUserWallet`, fetchUserWallet);

router.post(`/handleVendEspees`, async function (req: Request, res: Response) {
  console.log("Received request:", req.body);

  try {
    const { vendingToken, userWalletAddress, vendingAmount } = req.body;
    // Extract data from request body
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
    console.log("Success response:", data); // Log successful response
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    return res.sendStatus(400);
  }
});

router.post("/registerProduct", async (req: Request, res: Response) => {
  console.log("Received payment request:", req.body);

  // let currentProductId = 100; //Initialize outside the request handler to maintain state across requests

  const httpsAgent = new (axios.create as any)({
    httpsAgent: new https.Agent({
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
          value:
            "https://lwappstore.com/developers/uploads/espeesCoinOption5.png",
        },
      ],
    }),
  };

  try {
    const response = await httpsAgent.post(url, options.body, {
      headers: options.headers,
    });
    console.log("Response from API:", response.data); // Log successful response
    const data = response.data;
    res.status(200).json(response.data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Internal Server Error." });
  }
});

router.post("/initiatepayment", async (req: Request, res: Response) => {
  console.log("Received payment initialization request:", req.body);

  const {
    wallet,
    currency,
    amount,
    payername,
  } = req.body;

  // Get merchant address and password from query parameters
  const merchantAddress = req.query.merchantAddress as string;
  const merchantpwd = req.query.merchantpwd as string;

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

  console.log("Sending request with options:", JSON.stringify(options, null, 2));

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Response from API:", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Internal Server Error." });
  }
});

router.post("/getProject", async (req: Request, res: Response) => {
  console.log("Received get project request:", req.body);

  const url = "https://restapi.connectw.com/api/payment";

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // "x-api-key": apiKey, // Ensure the apiKey is defined in your environment or configuration
      admin: merchantAddress, // Ensure admin is defined as the merchant's address
      adminpwd: merchantpwd, // Ensure adminpwd is defined as the merchant's password
    },
    body: JSON.stringify({
      op: "getproject",
      params: [{ name: "getbalances", value: "true" }],
    }),
  };

  try {
    const response = await axios.post(url, options.body, {
      headers: options.headers,
    });
    console.log("Response from API:", response.data); // Log successful response
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Internal Server Error." });
  }
});

router.post("/recordTransaction", async (req: Request, res: Response) => {
  console.log("Received record payment request:", req.body);

  const url = "https://restapi.connectw.com/api/payment";

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // "x-api-key": apiKey,
      admin: merchantAddress,
      adminpwd: merchantpwd,
    },
    body: JSON.stringify({
      op: "recordpayment",
      params: [
        { name: "currency", value: req.body.currency || "USD" }, // Default to USD, can be overridden by request
        { name: "txid", value: req.body.txid },
        { name: "checkouttype", value: "paymentintent" },
      ],
    }),
  };

  try {
    const response = await axios.post(url, options.body, {
      headers: options.headers,
    });
    console.log("Response from API:", response.data); // Log successful response
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Internal Server Error." });
  }
});

// API #17: CREATE A SUB MERCHANT
router.post("/createSubMerchant", async (req: Request, res: Response) => {
  const { merchantAddr, merchantname, description } = req.body; // Extract values from request body
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
        { name: "merchantname", value: merchantname}, // Use value from request or empty string
        { name: "description", value: description}, // Use value from request or empty string
        {
          name: "merchantimage",
          value:
            "https://lwappstore.com/developers/uploads/espeesCoinOption5.png",
        },
        { name: "cancreatevirtualcards", value: "0" },
        { name: "maxtxn", value: "500" },
        { name: "mintxn", value: "1" },
        { name: "minbal", value: "1" },
      ],
    }),
  };

  try {
    const response = await axios.post(url, options.body, { headers: options.headers });
    console.log("Response from API:", response.data); // Log successful response
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Internal Server Error." });
  }
});

// API #18: UPDATE A SUB MERCHANT
router.post("/updateSubMerchant", async (res: Response) => {
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
    const response = await axios.post(url, options.body, { headers: options.headers });
    console.log("Response from API:", response.data); // Log successful response
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Internal Server Error." });
  }
});

// API #19: VIEW A SUB MERCHANT
router.post("/viewSubMerchant", async (req: Request, res: Response) => {
  const { merchantAddress } = req.body; // Get merchant address from request body
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
    const response = await axios.post(url, options.body, { headers: options.headers });
    console.log("Response from API:", response.data); // Log successful response
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Internal Server Error." });
  }
});

app.use(express.json());
app.use(router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:18012`);
});
