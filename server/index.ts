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
const merchantAddress: string = "0x0bd3e40f8410ea473850db5479348f074d254ded";
const merchantpwd: string = "1234";

declare module "express-session" {
  interface SessionData {
    initialBalance: string;
  }
}

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
    console.log(data);
    return res.status(200).json(data);
  } catch (error) {
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
      // "x-api-key": apiKey,
      admin: merchantAddress,
      adminpwd: merchantpwd,
    },
    body: JSON.stringify({
      op: "recordproduct",
      params: [
        { name: "productid", value: "100" },
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
    console.log("Response from API:", response.data);
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
    currency,
    wallet,
    amount,
    username
  }: { currency: string; wallet: string; amount: string; username: string; } = req.body;

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
        {
          name: "currency",
          value: currency,
        },
        {
          name: "address",
          value: wallet,
        },
        {
          name: "amount",
          value: amount,
        },
        {
          name: "success_url",
          value: "https://espees.vercel.app/buy/success",
        },
        {
          name: "cancel_url",
          value: "https://espees.vercel.app/buy/cancel",
        },
        {
          name: "feetype",
          value: "0",
        },
        {
          name: "passthrough",
          value: "0",
        },
        {
          name: "exchange",
          value: "0",
        },
        {
          name: "payername",
          value: username
        },
        {
          name: "token",
          value: "110"
        }
      ],
    }),
  };

  console.log(
    "Sending request with options:",
    JSON.stringify(options, null, 2)
  );

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
    console.log("Response from API:", response.data);
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
    console.log("Response from API:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Internal Server Error." });
  }
});

app.use(express.json());
app.use(router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
