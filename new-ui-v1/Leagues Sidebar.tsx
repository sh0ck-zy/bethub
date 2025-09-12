import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const topLeagues = [
  { name: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "bg-purple-600" },
  { name: "Eredivisie", flag: "🇳🇱", color: "bg-orange-600" },
  { name: "Champions League", flag: "⭐", color: "bg-blue-600" },
  { name: "La Liga", flag: "🇪🇸", color: "bg-red-600" },
  { name: "Bundesliga", flag: "🇩🇪", color: "bg-black" },
  { name: "Serie A", flag: "🇮🇹", color: "bg-green-600" },
  { name: "Europa League", flag: "🏆", color: "bg-orange-500" },
]

const countries = [
  { name: "International", flag: "🌍" },
  { name: "Algeria", flag: "🇩🇿" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Armenia", flag: "🇦🇲" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Azerbaijan", flag: "🇦🇿" },
  { name: "Bangladesh", flag: "🇧🇩" },
  { name: "Belarus", flag: "🇧🇾" },
  { name: "Belgium", flag: "🇧🇪" },
  { name: "Bolivia", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", flag: "🇧🇦" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Bulgaria", flag: "🇧🇬" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "Chile", flag: "🇨🇱" },
  { name: "China", flag: "🇨🇳" },
  { name: "Colombia", flag: "🇨🇴" },
  { name: "Costa Rica", flag: "🇨🇷" },
  { name: "Croatia", flag: "🇭🇷" },
  { name: "Cyprus", flag: "🇨🇾" },
  { name: "Czech Republic", flag: "🇨🇿" },
  { name: "Denmark", flag: "🇩🇰" },
  { name: "Ecuador", flag: "🇪🇨" },
  { name: "Egypt", flag: "🇪🇬" },
  { name: "El Salvador", flag: "🇸🇻" },
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "Estonia", flag: "🇪🇪" },
  { name: "Faroe Islands", flag: "🇫🇴" },
  { name: "Finland", flag: "🇫🇮" },
  { name: "France", flag: "🇫🇷" },
]

export function LeaguesSidebar() {
  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 h-screen lg:h-auto lg:min-h-screen">
      <ScrollArea className="h-full">
        <div className="p-4">
          {/* Top Leagues */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Top leagues</h3>
            <div className="space-y-1">
              {topLeagues.map((league) => (
                <Button
                  key={league.name}
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700 h-9 px-3 transition-colors text-sm"
                >
                  <div className={`w-3 h-3 rounded-full mr-3 ${league.color}`}></div>
                  <span className="truncate">{league.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* All Leagues */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">All leagues</h3>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>

            <div className="mb-3">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-700 h-8 px-3 text-sm"
              >
                Filter
              </Button>
            </div>

            <div className="space-y-1">
              {countries.map((country) => (
                <Button
                  key={country.name}
                  variant="ghost"
                  className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700 h-8 px-3 transition-colors group text-sm"
                >
                  <div className="flex items-center min-w-0">
                    <span className="w-4 h-4 flex items-center justify-center text-xs mr-3 flex-shrink-0">
                      {country.flag}
                    </span>
                    <span className="truncate">{country.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
}
