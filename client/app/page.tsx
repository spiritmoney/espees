import React from 'react'
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import Header from './components/Header';

const page = () => {
  return (
    <main className='bg-white w-screen h-screen overflow-x-hidden'>
      <Header />
      <Hero />
      <Features />
      {/* <Footer /> */}
    </main>
  );
}

export default page