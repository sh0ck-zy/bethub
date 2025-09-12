import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users } from "lucide-react"

const transfers = [
  {
    player: "Riccardo Calafiori",
    from: "Bologna",
    to: "Arsenal",
    fee: "€45M",
    avatar: "/riccardo-calafiori-player.png",
    fromLogo: "/bologna-fc-logo.png",
    toLogo: "/arsenal-fc-logo.png",
  },
  {
    player: "Luka Modric",
    from: "Real Madrid",
    to: "Inter Miami",
    fee: "€35M",
    avatar: "/luka-modric-player.png",
    fromLogo: "/real-madrid-logo.png",
    toLogo: "/inter-miami-logo.png",
  },
  {
    player: "Jamal Musiala",
    from: "Bayern Munich",
    to: "Manchester City",
    fee: "€120M",
    avatar: "/jamal-musiala-player.png",
    fromLogo: "/bayern-munich-logo.png",
    toLogo: "/manchester-city-logo.png",
  },
]

export function TransfersSection() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Top transfers</h3>
          <span className="text-xs text-gray-400">By fees</span>
        </div>

        {/* Transfer List */}
        <div className="space-y-4">
          {transfers.map((transfer, index) => (
            <div key={index} className="flex items-center space-x-3">
              {/* Player Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarImage src={transfer.avatar || "/placeholder.svg"} alt={transfer.player} />
                <AvatarFallback className="bg-gray-600 text-white text-xs">
                  {transfer.player
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              {/* Transfer Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{transfer.player}</p>
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <div className="flex items-center">
                    <img
                      src={transfer.fromLogo || "/placeholder.svg"}
                      alt={`${transfer.from} logo`}
                      className="w-3 h-3 mr-1"
                    />
                    <span>{transfer.from}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 mx-2 text-gray-500" />
                  <div className="flex items-center">
                    <img
                      src={transfer.toLogo || "/placeholder.svg"}
                      alt={`${transfer.to} logo`}
                      className="w-3 h-3 mr-1"
                    />
                    <span>{transfer.to}</span>
                  </div>
                </div>
              </div>

              {/* Transfer Fee */}
              <span className="text-sm font-semibold text-green-400">{transfer.fee}</span>
            </div>
          ))}
        </div>

        {/* Transfer Centre Section */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="text-center space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-300 mb-1">Transfer Centre</p>
              <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white hover:bg-gray-700">
                View all transfers
              </Button>
            </div>

            {/* Build Your XI Section */}
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-4 h-4 text-green-400 mr-2" />
                <p className="text-sm font-medium text-white">Build your own XI</p>
              </div>
              <p className="text-xs text-gray-400 mb-3">Try your lineup</p>

              {/* Formation Preview */}
              <div className="relative bg-green-800 rounded p-2 h-16">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-5 gap-1 w-full h-full">
                    {[...Array(11)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-white rounded-full opacity-60"
                        style={{
                          gridColumn: i < 4 ? i + 1 : i < 7 ? i - 2 : i - 5,
                          gridRow: i < 4 ? 1 : i < 7 ? 2 : 3,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs text-green-400 hover:text-green-300 hover:bg-gray-600"
              >
                Start building
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
