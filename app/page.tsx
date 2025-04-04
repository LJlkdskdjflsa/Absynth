import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Shield, Wallet, Heart, History } from "lucide-react"
import CharityBanner from "./components/charity-banner"
import FeaturedCharity from "./components/featured-charity"
import ImpactGallery from "./components/impact-gallery"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-xl font-bold">CharityChain</div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
              <span className="text-sm font-medium">USDC</span>
              <span className="font-medium">50.04</span>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <CharityBanner />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Validation Required
                </CardTitle>
                <CardDescription>
                  Please complete the validation process to ensure compliance with our donation policies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <h3 className="mb-2 text-lg font-medium">Validate you are non-criminal</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    This verification helps ensure all donations are from legitimate sources.
                  </p>
                  <Link href="/validate">
                    <Button>Start Validation</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <CharityCard
                id="1"
                title="Clean Water Initiative"
                description="Providing clean water to communities in need around the world."
                raised={12500}
                goal={25000}
              />
              <CharityCard
                id="2"
                title="Education for All"
                description="Supporting education programs for underprivileged children."
                raised={18750}
                goal={30000}
              />
              <CharityCard
                id="3"
                title="Hunger Relief Program"
                description="Distributing food to families facing food insecurity."
                raised={8200}
                goal={15000}
              />
              <CharityCard
                id="4"
                title="Wildlife Conservation"
                description="Protecting endangered species and their natural habitats."
                raised={21300}
                goal={40000}
              />
            </div>

            <FeaturedCharity />
            <ImpactGallery />
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Activity History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ActivityItem type="donation" amount={10} charity="Clean Water Initiative" time="2 hours ago" />
                  <ActivityItem type="deposit" amount={50} time="1 day ago" />
                  <ActivityItem type="validation" status="completed" time="1 day ago" />
                  <ActivityItem type="wallet" action="created" time="1 day ago" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function CharityCard({ id, title, description, raised, goal }) {
  const progress = (raised / goal) * 100

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <img
          src={`/placeholder.svg?height=200&width=400&text=${encodeURIComponent(title)}`}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-sm">
            <span>Raised: ${raised.toLocaleString()}</span>
            <span>Goal: ${goal.toLocaleString()}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-green-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <Link href={`/donate/${id}`}>
          <Button className="w-full">Donate</Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ type, amount, charity, status, action, time }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="rounded-full bg-gray-100 p-1.5">
        {type === "donation" && <Heart className="h-4 w-4 text-red-500" />}
        {type === "deposit" && <Wallet className="h-4 w-4 text-blue-500" />}
        {type === "validation" && <Shield className="h-4 w-4 text-green-500" />}
        {type === "wallet" && <Wallet className="h-4 w-4 text-purple-500" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">
          {type === "donation" && `Donated ${amount} USDC to ${charity}`}
          {type === "deposit" && `Deposited ${amount} USDC to wallet`}
          {type === "validation" && `Identity validation ${status}`}
          {type === "wallet" && `Wallet ${action}`}
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}

