"use client";
import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/30 backdrop-blur-md border-b border-white/50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center text-gray-800">
        <Link href="/" className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Logistics<span className="font-light text-gray-600">Track</span>
        </Link>
        <div className="space-x-6 font-medium text-sm">
          <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;