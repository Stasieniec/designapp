"use client";

import React from 'react';
import Link from 'next/link';
import Button from './Button';

// Add usePathname to determine current page
import { usePathname } from 'next/navigation';

export default function Navbar() {
  // Get current path
  const pathname = usePathname();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                AI Design Studio
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  pathname === '/' 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300'
                } text-sm font-medium`}
              >
                Home
              </Link>
              <Link 
                href="/design"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  pathname === '/design' 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300'
                } text-sm font-medium`}
              >
                Design Studio
              </Link>
              <Link 
                href="/features"
                className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  pathname === '/features' 
                    ? 'border-blue-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300'
                } text-sm font-medium`}
              >
                Features
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Link href="/design">
              <Button size="sm">
                Start Creating
              </Button>
            </Link>
          </div>
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="sm:hidden" id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <Link 
            href="/"
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              pathname === '/' 
                ? 'bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500 text-blue-700 dark:text-white' 
                : 'border-l-4 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/design"
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              pathname === '/design' 
                ? 'bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500 text-blue-700 dark:text-white' 
                : 'border-l-4 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'
            }`}
          >
            Design Studio
          </Link>
          <Link 
            href="/features"
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              pathname === '/features' 
                ? 'bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500 text-blue-700 dark:text-white' 
                : 'border-l-4 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'
            }`}
          >
            Features
          </Link>
        </div>
      </div>
    </nav>
  );
} 