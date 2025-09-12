"use client"

import { Search, Bell, User, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-300 hover:text-white hover:bg-gray-700"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* Logo */}
          <h1 className="text-xl font-bold text-white">FOTMOB</h1>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700">
              News
            </Button>
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700">
              Transfers
            </Button>
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700">
              About us
            </Button>
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Desktop Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 w-48 lg:w-64 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
            />
          </div>

          {/* Mobile Search Button */}
          <Button variant="ghost" size="icon" className="md:hidden text-gray-300 hover:text-white hover:bg-gray-700">
            <Search className="w-5 h-5" />
          </Button>

          {/* Action Buttons */}
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-gray-700">
            <Bell className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <User className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
