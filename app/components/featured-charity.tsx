import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function FeaturedCharity() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Featured Organization</CardTitle>
        <CardDescription>Learn about our spotlight charity of the month</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <img
            src="/placeholder.svg?height=300&width=400&text=Featured%20Charity"
            alt="Featured Charity"
            className="h-full w-full object-cover"
          />
          <div className="p-6">
            <h3 className="mb-2 text-xl font-bold">Global Health Initiative</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              The Global Health Initiative is dedicated to improving healthcare access in underserved communities
              worldwide. Through their network of volunteer doctors and nurses, they provide essential medical services,
              vaccinations, and health education to those who need it most.
            </p>
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Impact Score</span>
                <span className="text-sm font-medium">9.8/10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Transparency</span>
                <span className="text-sm font-medium">Excellent</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Years Active</span>
                <span className="text-sm font-medium">15</span>
              </div>
            </div>
            <Link href="/donate/featured">
              <Button className="w-full gap-2">
                Support This Cause
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

