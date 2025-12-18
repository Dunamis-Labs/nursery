export function BlogIntro() {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-[#faf9f6]">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2d5016] mb-6">From the Nursery</h1>
        <div className="text-lg text-[#2c2c2c] leading-relaxed space-y-3 max-w-3xl mx-auto">
          <p>
            These articles explore plant care decisions, seasonal considerations, and common questions customers ask
            when choosing and growing plants.
          </p>
          <p className="text-base text-muted-foreground">
            Our goal is to help you understand how to think about plants, not just what to do with them.
          </p>
        </div>
      </div>
    </section>
  )
}
