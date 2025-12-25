import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

interface ProductTabsProps {
  description: string
  specifications: Record<string, string | string[] | unknown>
  careInstructions: string
}

export function ProductTabs({ description, specifications, careInstructions }: ProductTabsProps) {
  // Ensure all props are strings
  const safeDescription = typeof description === 'string' ? description : String(description || '');
  const safeCareInstructions = typeof careInstructions === 'string' ? careInstructions : String(careInstructions || '');
  
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
          <div className="prose prose-sm max-w-none">
            {/* Check if description contains HTML tags */}
            {safeDescription.includes('<') && safeDescription.includes('>') ? (
              <div
                className="prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4 last:prose-p:mb-0"
                dangerouslySetInnerHTML={{ __html: safeDescription }}
              />
            ) : (
              // Plain text or markdown - split by double newlines for paragraphs, render markdown bold
              safeDescription.split(/\n\n+/).map((paragraph, index) => {
                const trimmed = paragraph.trim();
                
                return (
                  <p key={index} className="text-foreground leading-relaxed mb-4 last:mb-0">
                    {trimmed.split('\n').filter(line => line.trim().length > 0).map((line, lineIndex, array) => {
                      const lineText = line.trim();
                      
                      // Simple markdown bold parsing - split and render inline
                      const parts = lineText.split(/(\*\*[^*]+\*\*)/g).filter(p => p.length > 0);
                      
                      return (
                        <React.Fragment key={lineIndex}>
                          {parts.map((part, partIndex) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={`${lineIndex}-${partIndex}`} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
                            }
                            return <span key={`${lineIndex}-${partIndex}`}>{part}</span>;
                          })}
                          {lineIndex < array.length - 1 && <br />}
                        </React.Fragment>
                      );
                    })}
                  </p>
                );
              })
            )}
          </div>
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
          <div className="prose prose-sm max-w-none">
            {/* Check if careInstructions contains HTML tags */}
            {safeCareInstructions.includes('<') && safeCareInstructions.includes('>') ? (
              <div
                className="prose-headings:font-serif prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-3 first:prose-headings:mt-0 prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4 last:prose-p:mb-0"
                dangerouslySetInnerHTML={{ __html: safeCareInstructions }}
              />
            ) : (
              // Plain text - split by double newlines for paragraphs, handle markdown headings
              safeCareInstructions.split(/\n\n+/).map((paragraph, index) => {
                const trimmed = paragraph.trim();
                
                // Check if paragraph is a markdown heading
                if (trimmed.startsWith('#')) {
                  const level = trimmed.match(/^#+/)?.[0].length || 1;
                  const text = trimmed.replace(/^#+\s*/, '');
                  const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
                  return (
                    <HeadingTag 
                      key={index} 
                      className="font-serif text-foreground font-semibold mt-6 mb-3 first:mt-0"
                    >
                      {text}
                    </HeadingTag>
                  );
                }
                
                // Regular paragraph - render markdown bold
                return (
                  <p key={index} className="text-foreground leading-relaxed mb-4 last:mb-0">
                    {trimmed.split('\n').filter(line => line.trim().length > 0).map((line, lineIndex, array) => {
                      const lineText = line.trim();
                      
                      // Simple markdown bold parsing - split and render inline
                      const parts = lineText.split(/(\*\*[^*]+\*\*)/g).filter(p => p.length > 0);
                      
                      return (
                        <React.Fragment key={lineIndex}>
                          {parts.map((part, partIndex) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={`${lineIndex}-${partIndex}`} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
                            }
                            return <span key={`${lineIndex}-${partIndex}`}>{part}</span>;
                          })}
                          {lineIndex < array.length - 1 && <br />}
                        </React.Fragment>
                      );
                    })}
                  </p>
                );
              })
            )}
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
