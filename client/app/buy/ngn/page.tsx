"use client";

import React, { useState, useEffect } from "react";

const Page = ({}) => {
  const [instruction, setInstruction] = useState("");
  const [bankname, setBankname] = useState("");
  const [accountnumber, setAccountnumber] = useState("");
  const [accountname, setAccountname] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setInstruction(decodeURIComponent(params.get("instruction") || ""));
    setBankname(params.get("bankname") || "");
    setAccountnumber(params.get("accountnumber") || "");
    setAccountname(decodeURIComponent(params.get("accountname") || ""));
    setAmount(params.get("amount") || "");
  }, []);

  const handleClick = async () => {
    const url = "https://espees.onrender.com/recordTransaction";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currency: "NGN",
        txid: accountnumber,
      }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log("Response from API:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-screen grid place-items-center">
      <div className="grid place-items-center text-black w-auto h-auto py-10 px-32 mx-20 border rounded-xl border-gray-500 bg-white">
        <div className="text-center">
          <h1 className="font-bold text-[32px]">Payment Instructions</h1>
          <p className="text-lg">{instruction}</p>
          <br />
          <p className="text-xl font-semibold">
            Bank Name: <span className="font-normal">{bankname}</span>
          </p>
          <p className="text-xl font-semibold">
            Account Number: <span className="font-normal">{accountnumber}</span>
          </p>
          <p className="text-xl font-semibold">
            Account Name: <span className="font-normal">{accountname}</span>
          </p>
          <p className="text-xl font-semibold">
            Amount: <span className="font-normal">₦{amount}</span>
          </p>
          <br />
        </div>
        <div className="bg-blue-600 p-3 text-white font-semibold border rounded-2xl">
          <button onClick={handleClick}>Confirm Payment</button>
        </div>
      </div>
    </div>
  );
};

export default Page;
