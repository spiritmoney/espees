"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className="h-10 w-10 text-white"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className="h-10 w-10 text-white"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
};

const NavLink = ({ href, children }: NavLinkProps) => (
  <li className="hover:text-[#FFD700]">
    <a href={href}>{children}</a>
  </li>
);

const Sidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => (
  <div
    className={`fixed top-0 right-0 max-sm:w-64 h-full max-sm:bg-gradient-to-l from-blue-600 to-indigo-500 transform transition-transform ease-in-out duration-200 ${
      isOpen ? "translate-x-0" : "translate-x-full"
    } sm:static sm:translate-x-0 sm:bg-transparent sm:h-auto sm:flex sm:space-x-10 p-5 font-semibold text-lg sm:text-2xl`}
  >
    <button onClick={onClose} className="absolute top-0 right-0 m-2 sm:hidden">
      <CloseIcon />
    </button>
    <ul className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-5">
      <NavLink href="/">Home</NavLink>
      <NavLink href="/">About</NavLink>
      <NavLink href="/">Contact</NavLink>
      <NavLink href="/">Services</NavLink>
    </ul>
  </div>
);

const Header = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => setSidebarOpen(!isSidebarOpen);
  const handleSidebarClose = () => setSidebarOpen(false);

  return (
    <section className="py-2 px-4 sm:px-32 bg-white text-black w-full flex justify-around fixed top-0">
      <Link href="/">
        <Image
          src="/espeesCoinOption5.png"
          width={80}
          height={100}
          alt="Espees logo"
          className="cursor-pointer"
        />
      </Link>
      <p className="text-3xl font-bold"></p>
      <div className="py-5 sm:hidden">
        <button onClick={handleSidebarToggle}>
          {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
    </section>
  );
};

export default Header;
