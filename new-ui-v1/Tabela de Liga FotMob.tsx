import { Card } from "@/components/ui/card"

const premierLeagueTable = [
  { pos: 1, team: "Chelsea", played: 3, won: 3, drawn: 0, lost: 0, points: 9, logo: "/chelsea-fc-logo.png" },
  { pos: 2, team: "Arsenal", played: 3, won: 2, drawn: 1, lost: 0, points: 7, logo: "/arsenal-fc-logo.png" },
  { pos: 3, team: "Liverpool", played: 3, won: 2, drawn: 1, lost: 0, points: 7, logo: "/liverpool-fc-logo.png" },
  { pos: 4, team: "Man City", played: 3, won: 2, drawn: 0, lost: 1, points: 6, logo: "/manchester-city-logo.png" },
  { pos: 5, team: "Tottenham", played: 3, won: 2, drawn: 0, lost: 1, points: 6, logo: "/tottenham-hotspur-logo.png" },
  { pos: 6, team: "Everton", played: 3, won: 1, drawn: 2, lost: 0, points: 5, logo: "/everton-fc-logo.png" },
  { pos: 7, team: "Sunderland", played: 3, won: 1, drawn: 1, lost: 1, points: 4, logo: "/sunderland-afc-logo.png" },
  { pos: 8, team: "Bournemouth", played: 3, won: 1, drawn: 1, lost: 1, points: 4, logo: "/afc-bournemouth-logo.png" },
  { pos: 9, team: "Man United", played: 3, won: 1, drawn: 0, lost: 2, points: 3, logo: "/manchester-united-logo.png" },
  { pos: 10, team: "Aston Villa", played: 3, won: 1, drawn: 0, lost: 2, points: 3, logo: "/aston-villa-logo.png" },
  { pos: 11, team: "Brighton", played: 3, won: 1, drawn: 0, lost: 2, points: 3, logo: "/brighton-fc-logo.png" },
  { pos: 12, team: "Burnley", played: 3, won: 0, drawn: 1, lost: 2, points: 1, logo: "/burnley-fc-logo.png" },
]

export function LeagueTables() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Premier League</h3>
          <span className="text-xs text-gray-400">England</span>
        </div>

        {/* Table */}
        <div className="space-y-1">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-1 text-xs text-gray-400 pb-2 border-b border-gray-700 font-medium">
            <span className="col-span-1 text-center">#</span>
            <span className="col-span-5">Team</span>
            <span className="col-span-1 text-center">MP</span>
            <span className="col-span-1 text-center">W</span>
            <span className="col-span-1 text-center">D</span>
            <span className="col-span-1 text-center">L</span>
            <span className="col-span-2 text-center">PTS</span>
          </div>

          {/* Table Rows */}
          {premierLeagueTable.slice(0, 12).map((team) => (
            <div
              key={team.pos}
              className="grid grid-cols-12 gap-1 text-xs py-2 hover:bg-gray-700 rounded transition-colors cursor-pointer"
            >
              {/* Position */}
              <span className="col-span-1 text-gray-400 text-center font-medium">{team.pos}</span>

              {/* Team Name with Logo */}
              <div className="col-span-5 flex items-center">
                <img
                  src={team.logo || "/placeholder.svg?height=16&width=16"}
                  alt={`${team.team} logo`}
                  className="w-4 h-4 mr-2 flex-shrink-0"
                />
                <span className="text-white font-medium truncate">{team.team}</span>
              </div>

              {/* Stats */}
              <span className="col-span-1 text-gray-300 text-center">{team.played}</span>
              <span className="col-span-1 text-gray-300 text-center">{team.won}</span>
              <span className="col-span-1 text-gray-300 text-center">{team.drawn}</span>
              <span className="col-span-1 text-gray-300 text-center">{team.lost}</span>
              <span className="col-span-2 text-white font-semibold text-center">{team.points}</span>
            </div>
          ))}
        </div>

        {/* View Full Table Link */}
        <div className="mt-4 pt-3 border-t border-gray-700">
          <button className="text-xs text-gray-400 hover:text-white transition-colors">View full table</button>
        </div>
      </div>
    </Card>
  )
}
