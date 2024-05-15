import express, { Request, Response } from "express";
import cors from "cors";
import crypto from "crypto";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const router = express.Router();


app.use(bodyParser.json());

app.use(cors());
const port = process.env.PORT || 18012;

const apiKey: string = "V9yKoxl5EljDbawloXWHaD2zgclp28U9f5YSY3U3";
const agentWallet: string = "0x0bd3e40f8410ea473850db5479348f074d254ded";
const agentPin: string = "1234";

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
  _res: Response
): Promise<any> => {
  const { username } = req.body; // Extract username from request body

  console.log("fetchUserWallet request", username);

    const response = await fetch("https://api.espees.org/user/address", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({username: username}),
    });


    if (!response.ok) {
      throw new Error(`Failed to fetch wallet for user ${username}`);
    }
  
    const data = await response.json();
    console.log("fetchUserWallet response", data);
    return data;

   // Send the request with the username in the request body
  
};

router.post(`/fetchUserWallet`, fetchUserWallet);

router.post(`/handleVendEspees`, async function (req: Request, _res: Response) {
  console.log("Received request:", req.body); 
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
  const responseData = await response.json();
  console.log(responseData);
  return responseData;
});


app.use(express.json());
app.use(router);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})