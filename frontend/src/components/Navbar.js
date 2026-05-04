"use client";

import React, { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutDashboard, User } from 'lucide-react';
import Button from './ui/Button';

const Navbar = () => {
  const { user, logout, loading } = useContext(AuthContext);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0f172a] border-b border-slate-800">
      <div className="w-full px-4 sm:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Ethara Task
            </Link>
          </div>
          
          {!loading && (
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center">
                    <LayoutDashboard className="w-4 h-4 mr-1" />
                    Dashboard
                  </Link>
                  <div className="h-6 w-px bg-slate-700 mx-2"></div>
                  <div className="flex items-center text-sm font-medium text-slate-300">
                    <User className="w-4 h-4 mr-1 text-indigo-400" />
                    {user.name}
                  </div>
                  <Button variant="ghost" onClick={logout} className="ml-2 !px-3 !py-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30">
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary" className="!py-1.5 !px-4 text-sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
