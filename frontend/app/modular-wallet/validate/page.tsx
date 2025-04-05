"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, CheckCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ValidatePage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate validation process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (step < 3) {
        setStep(step + 1)
      } else {
        setCompleted(true)
      }
    } catch (error) {
      console.error("Validation failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    router.push("/modular-wallet")
  }

  if (completed) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Validation Complete</CardTitle>
            <CardDescription>Your identity has been successfully verified</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              You can now make donations to any charity on our platform.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleComplete} className="w-full">
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Identity Validation
            </CardTitle>
            <div className="text-sm font-medium">Step {step} of 3</div>
          </div>
          <CardDescription>
            {step === 1 && "Please provide your basic information"}
            {step === 2 && "Verify your identity with a government ID"}
            {step === 3 && "Review and confirm your information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" required />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="idType">ID Type</Label>
                  <select
                    id="idType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select ID Type</option>
                    <option value="passport">Passport</option>
                    <option value="driverLicense">Driver's License</option>
                    <option value="nationalId">National ID</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input id="idNumber" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idPhoto">Upload ID Photo</Label>
                  <Input id="idPhoto" type="file" className="cursor-pointer" required />
                  <p className="text-xs text-muted-foreground">Please upload a clear photo of your ID document</p>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium">Declaration</h3>
                  <p className="mb-4 text-sm text-muted-foreground">I hereby declare that:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Checkbox id="declaration1" required />
                      <Label htmlFor="declaration1" className="text-sm font-normal">
                        I have no criminal record related to financial crimes, fraud, or money laundering
                      </Label>
                    </li>
                    <li className="flex items-start gap-2">
                      <Checkbox id="declaration2" required />
                      <Label htmlFor="declaration2" className="text-sm font-normal">
                        The funds I will donate are from legitimate sources
                      </Label>
                    </li>
                    <li className="flex items-start gap-2">
                      <Checkbox id="declaration3" required />
                      <Label htmlFor="declaration3" className="text-sm font-normal">
                        All information I have provided is accurate and complete
                      </Label>
                    </li>
                  </ul>
                </div>
              </>
            )}

            <div className="flex justify-between">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              ) : (
                <Link href="/modular-wallet">
                  <Button variant="outline">Cancel</Button>
                </Link>
              )}
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step < 3 ? "Continue" : "Complete Validation"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

