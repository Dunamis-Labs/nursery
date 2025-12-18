import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/lush-green-plant-nursery-greenhouse-with-tropical-.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <h2 className="font-serif text-5xl md:text-7xl font-bold mb-6 text-balance">Cultivate Your Green Sanctuary</h2>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-balance opacity-95">
          Discover premium plants, expert gardening advice, and everything you need to create your perfect garden
        </p>
        <p className="text-base mb-8 max-w-3xl mx-auto opacity-90 leading-relaxed">
          The Plant Nursery is an online plant nursery offering indoor and outdoor plants, beginner-friendly care
          guidance, and reliable plant delivery across Australia.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" className="bg-[#2d5016] hover:bg-[#2d5016]/90 text-white font-medium px-8">
            Shop Plants
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20"
          >
            Explore Guides
          </Button>
        </div>
      </div>
    </section>
  )
}
