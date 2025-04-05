import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart } from "lucide-react"

export default function CharityBanner() {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img
          src="/placeholder.svg?height=300&width=1200&text=Help%20Make%20a%20Difference"
          alt="Charity Banner"
          className="h-64 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent">
          <div className="flex h-full flex-col justify-center p-8 text-white md:w-2/3">
            <h2 className="mb-2 text-3xl font-bold">Make a Difference Today</h2>
            <p className="mb-6 text-lg">
              Your donation can change lives. Join us in our mission to create a Absynth for everyone.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/validate">
                <Button className="gap-2 bg-white text-black hover:bg-gray-100">Get Verified</Button>
              </Link>
              <Link href="/donate/1">
                <Button variant="outline" className="gap-2 border-white text-white hover:bg-white/20">
                  <Heart className="h-4 w-4" />
                  Donate Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <CardContent className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
        <StatCard title="$125,000" description="Total Donations" icon="💰" />
        <StatCard title="1,250" description="Verified Donors" icon="👥" />
        <StatCard title="15" description="Charity Partners" icon="🤝" />
      </CardContent>
    </Card>
  )
}

function StatCard({ title, description, icon }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">{icon}</div>
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

