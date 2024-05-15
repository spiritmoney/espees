import Image from "next/image";
import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <section className="py-5 px-32 bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-screen flex justify-between fixed top-0">
      <Link href="/">
        <Image
        src="/espeesCoinOption5.png"
        width={80}
        height={100}
        alt="Espees logo"
        className="cursor-pointer"
        />
      </Link>
      <div className="py-5">
        <ul className="flex space-x-10 px-5 font-semibold text-lg ">
          <li className="hover:text-[#FFD700]">
            <a href="/">Home</a>
          </li>
          <li className="hover:text-[#FFD700]">
            <a href="/">About</a>
          </li>
          <li className="hover:text-[#FFD700]">
            <a href="/">Contact</a>
          </li>
          <li className="hover:text-[#FFD700]">
            <a href="/">Services</a>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Header;
