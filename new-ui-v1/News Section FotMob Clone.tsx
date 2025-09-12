import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const newsArticles = [
  {
    title: "Brighton 2-1 Manchester City: Welbeck and Gross complete stunning turnaround",
    time: "2h ago",
    image: "/brighton-vs-manchester-city-football-match.png",
  },
  {
    title: "Premier League Matchday Live: VAR Chaos as Liverpool vs Arsenal After Chelsea 'Error'",
    time: "3h ago",
    image: "/premier-league-var-controversy.png",
  },
  {
    title: "Man City Player Ratings vs Brighton: Haaland, Rodri and De Bruyne all 5/10",
    time: "4h ago",
    image: "/manchester-city-player-ratings.png",
  },
  {
    title: "Record Suffer Another Injury Liverpool Clash",
    time: "5h ago",
    image: "/liverpool-injury-news.png",
  },
  {
    title: "Nottingham Forest 3-0 West Ham: Gibbs-White leads the way as Forest secure big win",
    time: "1h ago",
    image: "/nottingham-forest-vs-west-ham.png",
  },
]

export function NewsSection() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <div className="p-4">
        <h3 className="font-semibold text-white mb-4">News</h3>

        <div className="space-y-4">
          {newsArticles.map((article, index) => (
            <div
              key={index}
              className="flex space-x-3 cursor-pointer hover:bg-gray-700 rounded p-2 -m-2 transition-colors"
            >
              {/* Article Image */}
              <div className="flex-shrink-0">
                <img
                  src={article.image || "/placeholder.svg?height=60&width=80"}
                  alt=""
                  className="w-20 h-15 object-cover rounded bg-gray-700"
                />
              </div>

              {/* Article Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white line-clamp-3 leading-tight mb-2">{article.title}</h4>
                <p className="text-xs text-gray-400">{article.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* See More Button */}
        <Button
          variant="ghost"
          className="w-full mt-4 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          See more
        </Button>
      </div>
    </Card>
  )
}
