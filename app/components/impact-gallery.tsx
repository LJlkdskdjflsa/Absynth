import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ImpactGallery() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Our Impact</CardTitle>
        <CardDescription>See how your donations are making a difference</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="water">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="water">Water</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
          </TabsList>
          <TabsContent value="water" className="mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ImpactCard
                image="/placeholder.svg?height=200&width=300&text=Clean%20Water%20Project"
                title="Clean Water Wells"
                description="Provided clean water access to 25,000 people in rural communities"
              />
              <ImpactCard
                image="/placeholder.svg?height=200&width=300&text=Water%20Filtration"
                title="Water Filtration Systems"
                description="Installed 500 water filtration systems in schools and clinics"
              />
              <ImpactCard
                image="/placeholder.svg?height=200&width=300&text=Water%20Education"
                title="Water Conservation"
                description="Educated 10,000 farmers on sustainable water usage techniques"
              />
            </div>
          </TabsContent>
          <TabsContent value="education" className="mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ImpactCard
                image="/placeholder.svg?height=200&width=300&text=School%20Building"
                title="School Construction"
                description="Built 15 new schools in underserved communities"
              />
              <ImpactCard
                image="/placeholder.svg?height=200&width=300&text=Scholarships"
                title="Scholarship Program"
                description="Provided 250 scholarships to promising students"
              />
              <ImpactCard
                image="/placeholder.svg?height=200&width=300&text=Teacher%20Training"
                title="Teacher Training"
                description="Trained 500 teachers in modern educational methods"
              />
            </div>
          </TabsContent>
          <TabsContent value="health" className="mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ImpactCard
                image="/placeholder.svg?height=200&width=300&text=Medical%20Clinics"
                title="Mobile Clinics"
                description="Provided healthcare to 35,000 people in remote areas"
              />
              <ImpactCard
                image="/placeholder.svg?height=200&width=300&text=Vaccinations"
                title="Vaccination Programs"
                description="Administered 50,000 vaccines to children and adults"
              />
              <ImpactCard
                image="/placeholder.svg?height=200&width=300&text=Medical%20Training"
                title="Healthcare Training"
                description="Trained 300 community health workers"
              />
            </div>
          </TabsContent>
          <TabsContent value="environment" className="mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ImpactCard
                image="/placeholder.svg?height=200&width=300&text=Reforestation"
                title="Reforestation"
                description="Planted 100,000 trees in deforested areas"
              />
              <ImpactCard
                image="/placeholder.svg?height=200&width=300&text=Clean%20Energy"
                title="Renewable Energy"
                description="Installed solar panels in 50 villages"
              />
              <ImpactCard
                image="/placeholder.svg?height=200&width=300&text=Wildlife%20Protection"
                title="Wildlife Protection"
                description="Protected 10,000 acres of critical wildlife habitat"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function ImpactCard({ image, title, description }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <img src={image || "/placeholder.svg"} alt={title} className="h-40 w-full object-cover" />
      <div className="p-4">
        <h3 className="mb-1 font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

