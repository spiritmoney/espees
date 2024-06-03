import Image from "next/image";
import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-blue-500 to-indigo-500 p-20 mix-blend-normal overflow-y-hidden mt-10">
      <div className="flex-col justify-center items-start">
        <div className="flex justify-center items-center max-sm:flex-col">
          <div className="px-1 sm:w-[550px] text-white grid place-items-center">
            <p className="text-[64px] font-bold text-wrap leading-normal max-sm:text-[50px]">
              Respelling <br /> Your <br /> Finances
            </p>
            <div className="mt-4">
              <Link href="/buy">
                <button className="border-2 border-white px-8 py-2 rounded-lg text-[22px] font-medium text-white hover:bg-white hover:text-blue-600 active:bg-white active:text-indigo-800">
                  Buy
                </button>
              </Link>
            </div>
          </div>
          <Image
            src="/espees.png"
            width={543}
            height={642}
            alt="Espees app"
            loading="lazy"
            className="mt-7"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
