import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Tv } from "lucide-react"

const matches = [
  {
    league: "England - Premier League",
    leagueColor: "bg-purple-600",
    matches: [
      {
        home: "Brighton",
        away: "Man City",
        homeScore: 2,
        awayScore: 1,
        status: "FT",
        homeLogo: "/brighton-fc-logo.png",
        awayLogo: "/manchester-city-logo.png",
      },
      {
        home: "Nottm Forest",
        away: "West Ham",
        homeScore: 3,
        awayScore: 0,
        status: "FT",
        homeLogo: "/nottingham-forest-logo.png",
        awayLogo: "/west-ham-united-badge.png",
      },
      {
        home: "Liverpool",
        away: "Arsenal",
        homeScore: 0,
        awayScore: 0,
        status: "Live",
        minute: "45+2",
        homeLogo: "/liverpool-fc-logo.png",
        awayLogo: "/arsenal-fc-logo.png",
      },
      {
        home: "Aston Villa",
        away: "Crystal Palace",
        homeScore: null,
        awayScore: null,
        status: "20:00",
        homeLogo: "/aston-villa-logo.png",
        awayLogo: "/crystal-palace-logo.png",
      },
    ],
  },
  {
    league: "Netherlands - Eredivisie",
    leagueColor: "bg-orange-600",
    matches: [
      {
        home: "Fortuna Sittard",
        away: "NEC Nijmegen",
        homeScore: 1,
        awayScore: 2,
        status: "FT",
        homeLogo: "/fortuna-sittard-logo.png",
        awayLogo: "/nec-nijmegen-logo.png",
      },
      {
        home: "PEC Zwolle",
        away: "FC Utrecht",
        homeScore: 0,
        awayScore: 2,
        status: "FT",
        homeLogo: "/pec-zwolle-logo.png",
        awayLogo: "/fc-utrecht-logo.png",
      },
      {
        home: "Sparta Rotterdam",
        away: "Feyenoord",
        homeScore: 0,
        awayScore: 1,
        status: "FT",
        homeLogo: "/sparta-rotterdam-logo.png",
        awayLogo: "/feyenoord-logo.png",
      },
      {
        home: "NEC Breda",
        away: "AZ Alkmaar",
        homeScore: 0,
        awayScore: 1,
        status: "FT",
        homeLogo: "/nac-breda-logo.png",
        awayLogo: "/az-alkmaar-logo.png",
      },
    ],
  },
  {
    league: "Spain - LaLiga",
    leagueColor: "bg-red-600",
    matches: [
      {
        home: "Celta Vigo",
        away: "Valencia",
        homeScore: 1,
        awayScore: 1,
        status: "FT",
        homeLogo: "/celta-vigo-logo.png",
        awayLogo: "/valencia-cf-logo.png",
      },
      {
        home: "Real Betis",
        away: "Atletico Madrid",
        homeScore: 1,
        awayScore: 0,
        status: "FT",
        homeLogo: "/real-betis-logo.png",
        awayLogo: "/atletico-madrid-logo.png",
      },
      {
        home: "Espanyol",
        away: "Osasuna",
        homeScore: null,
        awayScore: null,
        status: "16:15",
        homeLogo: "/espanyol-logo.png",
        awayLogo: "/ca-osasuna-logo.png",
      },
      {
        home: "Rayo Vallecano",
        away: "Barcelona",
        homeScore: null,
        awayScore: null,
        status: "18:30",
        homeLogo: "/placeholder.svg?height=20&width=20",
        awayLogo: "/placeholder.svg?height=20&width=20",
      },
    ],
  },
  {
    league: "Germany - Bundesliga",
    leagueColor: "bg-black",
    matches: [
      {
        home: "Wolfsburg",
        away: "Mainz",
        homeScore: 1,
        awayScore: 1,
        status: "FT",
        homeLogo: "/placeholder.svg?height=20&width=20",
        awayLogo: "/placeholder.svg?height=20&width=20",
      },
      {
        home: "Dortmund",
        away: "Union Berlin",
        homeScore: 2,
        awayScore: 0,
        status: "FT",
        homeLogo: "/placeholder.svg?height=20&width=20",
        awayLogo: "/placeholder.svg?height=20&width=20",
      },
      {
        home: "Köln",
        away: "Freiburg",
        homeScore: null,
        awayScore: null,
        status: "15:30",
        homeLogo: "/placeholder.svg?height=20&width=20",
        awayLogo: "/placeholder.svg?height=20&width=20",
      },
    ],
  },
  {
    league: "Italy - Serie A",
    leagueColor: "bg-green-600",
    matches: [
      {
        home: "Genoa",
        away: "Juventus",
        homeScore: 0,
        awayScore: 0,
        status: "Live",
        minute: "67'",
        homeLogo: "/placeholder.svg?height=20&width=20",
        awayLogo: "/placeholder.svg?height=20&width=20",
      },
      {
        home: "Sassuolo",
        away: "Fiorentina",
        homeScore: 0,
        awayScore: 0,
        status: "Live",
        minute: "23'",
        homeLogo: "/placeholder.svg?height=20&width=20",
        awayLogo: "/placeholder.svg?height=20&width=20",
      },
      {
        home: "Lazio",
        away: "Hellas Verona",
        homeScore: null,
        awayScore: null,
        status: "20:45",
        homeLogo: "/placeholder.svg?height=20&width=20",
        awayLogo: "/placeholder.svg?height=20&width=20",
      },
    ],
  },
  {
    league: "France - Ligue 1",
    leagueColor: "bg-blue-600",
    matches: [
      {
        home: "Angers",
        away: "Rennes",
        homeScore: 1,
        awayScore: 1,
        status: "FT",
        homeLogo: "/placeholder.svg?height=20&width=20",
        awayLogo: "/placeholder.svg?height=20&width=20",
      },
    ],
  },
]

export function LiveScoresFeed() {
  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-white">Today</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
            >
              Ongoing
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
            >
              <Tv className="w-3 h-3 mr-1" />
              On TV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
            >
              <Clock className="w-3 h-3 mr-1" />
              By time
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
            >
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Matches by League */}
      {matches.map((leagueData) => (
        <Card key={leagueData.league} className="bg-gray-800 border-gray-700 overflow-hidden">
          <div className="p-4">
            {/* League Header */}
            <div className="flex items-center mb-4">
              <div className={`w-3 h-3 rounded-full mr-3 ${leagueData.leagueColor}`}></div>
              <h3 className="font-semibold text-white text-sm">{leagueData.league}</h3>
            </div>

            {/* Matches */}
            <div className="space-y-2">
              {leagueData.matches.map((match, index) => (
                <div
                  key={index}
                  className="flex items-center py-2 px-2 rounded hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  {/* Status/Time */}
                  <div className="w-12 flex justify-center">
                    {match.status === "Live" ? (
                      <Badge variant="secondary" className="bg-green-600 text-white text-xs px-1 py-0 h-5">
                        {match.minute}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">{match.status}</span>
                    )}
                  </div>

                  {/* Match Details */}
                  <div className="flex-1 ml-4">
                    {/* Home Team */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <img
                          src={match.homeLogo || "/placeholder.svg"}
                          alt={`${match.home} logo`}
                          className="w-4 h-4 mr-2"
                        />
                        <span className="text-sm text-gray-300">{match.home}</span>
                      </div>
                      <span className="text-sm font-semibold text-white min-w-[20px] text-right">
                        {match.homeScore !== null ? match.homeScore : ""}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={match.awayLogo || "/placeholder.svg"}
                          alt={`${match.away} logo`}
                          className="w-4 h-4 mr-2"
                        />
                        <span className="text-sm text-gray-300">{match.away}</span>
                      </div>
                      <span className="text-sm font-semibold text-white min-w-[20px] text-right">
                        {match.awayScore !== null ? match.awayScore : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
