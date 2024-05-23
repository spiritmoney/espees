"use client";
import React, { FormEvent, useState } from "react";
import Header from "../components/Header";

interface ApiResponse {
  statusCode: number;
  message: string;
}

const convertEspeesToCurrency = (espees: string, currency: string) => {
  switch (currency) {
    case "USD":
    case "EUR":
      return espees; // 1 Espees = 1 USD/EUR
    case "NGN":
      return parseInt(espees) * 1500; // 1 Espees = 1500 NGN
    default:
      return espees; // Default to Espees if no match
  }
};

const page = () => {
  const [username, setUsername] = useState<string>("");
  const [vendingAmount, setVendingAmount] = useState<string>(""); // Set initial value to 0
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>("USD");

  const fetchVendingToken = async () => {
    try {
      const response = await fetch(
        "https://espees.onrender.com/fetchVendingToken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log(data.vending_token);
      return data.vending_token;
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserWallet = async () => {
    try {
      console.log("running");
      const response = await fetch(
        "https://espees.onrender.com/fetchUserWallet",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: username }),
        }
      );
      const data = await response.json();
      console.log(data.wallet_id);
      return data.wallet_id;
    } catch (err) {
      console.error(err);
    }
  };

  const checkBalanceAndInitiatePayment = async () => {
    try {
      console.log("Checking balance and initiating payment");

      const response = await fetch("https://espees.onrender.com/balanceCheck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to initiate payment with balance check");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handlePaymentInitialization = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setIsLoading(true);

    await checkBalanceAndInitiatePayment();

    const userWalletAddress = await fetchUserWallet();

    const convertedAmount = convertEspeesToCurrency(vendingAmount, currency).toString();

    try {
      const response = await fetch(
        "https://espees.onrender.com/initiatePayment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currency: currency,
            wallet: userWalletAddress,
            amount: convertedAmount,
          }),
        }
      );
      const data = await response.json();
      console.log("Response:", data); // Log the response data
      setApiResponse(data);
      // Check if the result is true and redirect
      if ((data.result && currency === "USD") || currency === "EUR") {
        window.location.href = data.url;
      } else if (data.result && currency === "NGN") {
        window.location.href = `https://espees.vercel.app/buy/ngn?instruction=${encodeURIComponent(
          data.instruction
        )}&bankname=${data.bankname}&accountnumber=${
          data.accountnumber
        }&accountname=${encodeURIComponent(data.accountname)}&amount=${
          data.amount
        }&result=${data.result}`;
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
      setApiResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVendEspees = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const vendingToken = await fetchVendingToken();
    const userWalletAddress = await fetchUserWallet();

    const convertedAmount = convertEspeesToCurrency(vendingAmount, currency).toString();

    console.log(
      `Vending Token: ${vendingToken}, User Wallet Address: ${userWalletAddress}`
    );

    try {
      const response = await fetch(
        "https://espees.onrender.com/handleVendEspees",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vendingToken: vendingToken,
            userWalletAddress: userWalletAddress,
            vendingAmount: convertedAmount,
          }),
        }
      );
      const data = await response.json();
      console.log("Response:", data); // Log the response data
      setApiResponse(data);
    } catch (error) {
      console.error("Error vending Espees:", error);
      setApiResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className=" overflow-x-hidden h-screen">
      <div className=" bg-gradient-to-r from-blue-500 to-indigo-500 w-screen h-screen flex justify-center items-center shadow-2xl">
        <form onSubmit={handlePaymentInitialization}>
          <div className="flex-col border p-10 rounded-lg bg-white border-gray-300">
            {/* Input for username */}
            <div className="py-5 text-black">
              <p>Espees Account to fund</p>
              <input
                type="text"
                placeholder="Espees wallet Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="focus:outline-none focus:ring-transparent border-2 p-2 rounded-md "
              />
            </div>

            {/* Input for amount to vend */}
            <div className="py-5 text-black">
              <p>Amount you want to Buy (Espees)</p>
              <input
                type="number"
                placeholder="Enter amount in Espees"
                value={vendingAmount}
                onChange={(e) => setVendingAmount(e.target.value)}
                className="focus:outline-none focus:ring-transparent border-2 p-2 rounded-md"
              />
            </div>
            {/* Input for amount to initialize payment */}
            <div className="py-5 text-black">
              <p>Currency (USD, NGN, EUR)</p>
              <select
                name="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="focus:outline-none focus:ring-transparent border-2 p-2 rounded-md"
              >
                <option value="USD">USD</option>
                <option value="NGN">NGN</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            {/* Button to trigger vending */}
            <button
              className="border-2 border-white px-8 py-2 rounded-lg text-[16px] font-medium bg-blue-600 text-white"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Buy"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
export default page;
