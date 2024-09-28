"use client";

import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

const page = () => {
  const [showForm, setShowForm] = useState(false); // New state to control form visibility
  const [merchantAddr, setMerchantAddress] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [merchantName, setMerchantName] = useState(""); // New state for merchant name
  const [description, setDescription] = useState(""); // New state for description
  const [activeButton, setActiveButton] = useState(""); // New state for active button

  const handleCreateMerchantClick = () => {
    setShowForm(prev => !prev); // Toggle the form visibility
  };

  const handleButtonClick = (buttonName: string) => { // Explicitly define buttonName as a string
    setActiveButton(buttonName); // Set the active button
    // ... existing button click logic ...
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("http://localhost:18012/createSubMerchant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchantAddress: merchantAddr,
          merchantname: merchantName,
          description,
        }),
      });
      const data = await response.json();
      setResponseData(data);
      toast.success("Sub Merchant created successfully!"); // Success toast
    } catch (err) {
      console.error("Create Error:", err);
      toast.error("Create Error: " + err); // Error toast
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch("/updateSubMerchant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchantAddress: merchantAddr /* other data */,
        }),
      });
      const data = await response.json();
      setResponseData(data);
      toast.success("Sub Merchant updated successfully!"); // Success toast
    } catch (err) {
      console.error("Update Error:", err);
      toast.error("Update Error: " + err); // Error toast
    }
  };

  const handleView = async () => {
    try {
      const response = await fetch("/viewSubMerchant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ merchantAddr }),
      });
      const data = await response.json();
      setResponseData(data);
    } catch (err) {
      console.error("View Error:", err); // Log error to console
    }
  };

  const handleViewAll = async () => {
    try {
      const response = await fetch("/viewAllSubMerchants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ merchantAddr }),
      });
      const data = await response.json();
      setResponseData(data);
    } catch (err) {
      console.error("View All Error:", err); // Log error to console
    }
  };

  const handleTotalDeposits = async () => {
    try {
      const response = await fetch("/viewTotalDeposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          /* data */
        }),
      });
      const data = await response.json();
      setResponseData(data);
    } catch (err) {
      console.error("Total Deposits Error:", err); // Log error to console
    }
  };

  const handleTotalWithdrawals = async () => {
    try {
      const response = await fetch("/viewTotalWithdrawals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          /* data */
        }),
      });
      const data = await response.json();
      setResponseData(data);
    } catch (err) {
      console.error("Total Withdrawals Error:", err); // Log error to console
    }
  };

  const handleTotalBalance = async () => {
    try {
      const response = await fetch("http://localhost:18012/viewTotalBalance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          /* data */
        }),
      });
      const data = await response.json();
      setResponseData(data);
    } catch (err) {
      console.error("Total Balance Error:", err); // Log error to console
    }
  };

  return (
    <>
      <ToastContainer /> {/* Add ToastContainer to render toasts */}
      <main className="bg-white w-screen h-screen flex items-center justify-center">
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col space-y-5">
            <button
              onClick={() => { handleButtonClick("createMerchant"); handleCreateMerchantClick(); }} // Button to open the form
              className={`p-3 w-60 text-white rounded-lg cursor-pointer transition duration-200 ${activeButton === "createMerchant" ? "bg-indigo-600" : "bg-blue-600"}`}
            >
              Create Merchant
            </button>
            {showForm && ( // Conditional rendering of the form
              <>
                <h1 className="text-center text-2xl font-bold mb-4 text-gray-800">
                  Sub Merchant Management
                </h1>
                <input
                  type="text"
                  placeholder="Merchant Address"
                  value={merchantAddr}
                  onChange={(e) => setMerchantAddress(e.target.value)}
                  className="w-full p-2 mb-4 border border-gray-300 text-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Merchant Name" // New input for merchant name
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full p-2 mb-4 border border-gray-300 text-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Description" // New input for description
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 mb-4 border border-gray-300 text-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCreate}
                  className="w-full p-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-indigo-600 transition duration-200"
                >
                  Create Sub Merchant
                </button>
              </>
            )}
          </div>
          <div>
            <button
              onClick={() => { handleButtonClick("viewAll"); handleViewAll(); }} // Button to view all sub merchants
              className={`bg-blue-600 p-3 w-60 rounded-lg ${activeButton === "viewAll" ? "bg-indigo-600" : ""}`}
            >
              View all Sub Merchants
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default page;
