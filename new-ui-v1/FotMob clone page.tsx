"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { LeaguesSidebar } from "@/components/leagues-sidebar"
import { LiveScoresFeed } from "@/components/live-scores-feed"
import { TransfersSection } from "@/components/transfers-section"
import { NewsSection } from "@/components/news-section"
import { LeagueTables } from "@/components/league-tables"

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Left Sidebar */}
        <div
          className={`
            fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
            transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            lg:translate-x-0 transition-transform duration-300 ease-in-out
            lg:block
          `}
        >
          <LeaguesSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-screen">
          {/* Live Scores Feed */}
          <main className="flex-1 p-4 lg:p-6">
            <LiveScoresFeed />
          </main>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-80 p-4 lg:p-6 space-y-6 bg-gray-900 lg:bg-transparent">
            <TransfersSection />
            <NewsSection />
            <LeagueTables />
          </aside>
        </div>
      </div>
    </div>
  )
}
