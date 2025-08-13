import Link from "next/link";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">How BOKT Works</h1>
          <p className="text-xl text-muted-foreground">Connecting brands with talented models in just a few steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-black">1</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Browse Models</h3>
            <p className="text-muted-foreground">Explore our curated selection of professional models across different categories and locations.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-black">2</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Book Directly</h3>
            <p className="text-muted-foreground">Book models directly through our platform with your project details and budget.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-black">3</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Create Amazing Content</h3>
            <p className="text-muted-foreground">Work with talented professionals to bring your brand vision to life.</p>
          </div>
        </div>

        <div className="bg-muted rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">For Models</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Apply to Join</h4>
              <p className="text-muted-foreground">Submit your application with portfolio photos and get approved by our team.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Get Discovered</h4>
              <p className="text-muted-foreground">Brands can find you based on your skills, location, and availability.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Direct Bookings</h4>
              <p className="text-muted-foreground">Receive booking requests directly and negotiate terms that work for you.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Build Your Career</h4>
              <p className="text-muted-foreground">Grow your portfolio and client base through our platform.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <div className="space-x-4">
            <Link href="/models" className="inline-block rounded-md bg-accent px-6 py-3 font-semibold text-black hover:bg-accent/90 transition-colors">
              Browse Models
            </Link>
            <Link href="/auth/model-application" className="inline-block rounded-md border border-border bg-muted px-6 py-3 font-semibold text-foreground hover:bg-background transition-colors">
              Apply as Model
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
