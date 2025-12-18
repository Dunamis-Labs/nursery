import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

interface ProductTabsProps {
  description: string
  specifications: Record<string, string | string[] | unknown>
  careInstructions: string
}

export function ProductTabs({ description, specifications, careInstructions }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="mb-16">
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
        <TabsTrigger
          value="description"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#87a96b] data-[state=active]:bg-transparent px-6 py-3"
        >
          Description
        </TabsTrigger>
        <TabsTrigger
          value="specifications"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#87a96b] data-[state=active]:bg-transparent px-6 py-3"
        >
          Specifications
        </TabsTrigger>
        <TabsTrigger
          value="care"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#87a96b] data-[state=active]:bg-transparent px-6 py-3"
        >
          Care Instructions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <Card className="p-6 border-border">
          <p className="text-foreground leading-relaxed">{description}</p>
        </Card>
      </TabsContent>

      <TabsContent value="specifications" className="mt-6">
        <Card className="p-6 border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(specifications).map(([key, value]) => {
              const displayValue = Array.isArray(value) 
                ? value.join(', ') 
                : typeof value === 'object' && value !== null
                ? JSON.stringify(value)
                : String(value || 'N/A')
              
              return (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 border-b border-border last:border-0"
                >
                  <span className="font-semibold text-foreground min-w-[180px]">{key}:</span>
                  <span className="text-muted-foreground">{displayValue}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="care" className="mt-6">
        <Card className="p-6 border-border">
          <div
            className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-3 first:prose-headings:mt-0 prose-p:text-muted-foreground prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: careInstructions }}
          />
        </Card>
      </TabsContent>
    </Tabs>
  )
}
