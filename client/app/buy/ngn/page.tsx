"use client";

import React, { useState } from "react";

const Page = ({}) => {

  const handleClick = async () => {
    const paymentAmount = "1000"; // replace this with the actual amount

    try {
      const response = await fetch(
        "https://espees.onrender.com/checkBalanceAndRedirect",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentAmount }),
        }
      );

      if (response.redirected) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-screen grid place-items-center">
      <div className="grid place-items-center text-black w-auto h-auto py-10 px-32 mx-20 border rounded-xl border-gray-500 bg-white">
        <div className="text-center">
          <h1 className="font-bold text-[32px]">Payment Instructions</h1>
          <p className="text-lg">
            Please deposit the amount shown into the FCMB account with name and
            account number indicated. On completion, please return and click the
            Update or Confirm button to check and receive the credit onchain for
            your deposit.
          </p>
          <br />
          <p className="text-xl font-semibold">
            Bank Name: <span className="font-normal">FCMB</span>
          </p>
          <p className="text-xl font-semibold">
            Account Number: <span className="font-normal">8900593593</span>
          </p>
          <p className="text-xl font-semibold">
            Account Name: <span className="font-normal">EspeesPartner Deposit Account for</span>
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
