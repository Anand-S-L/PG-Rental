import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Building, Users, Shield, Clock, Briefcase } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-white">
          {/* Hero Section */}
          <div className="relative overflow-hidden bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                  <div className="sm:text-center lg:text-left">
                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                      <span className="block xl:inline">Providing Quality</span>{' '}
                      <span className="block text-primary xl:inline">PG Accommodations</span>
                    </h1>
                    <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                      Founded in 2020, PG Rental has been providing quality and affordable PG accommodations to students and working professionals.
                    </p>
                    <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                      <div className="rounded-md shadow">
                        <Link href="/">
                          <Button size="lg">
                            Browse Accommodations
                          </Button>
                        </Link>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:ml-3">
                        <Link href="/contact">
                          <Button variant="outline" size="lg">
                            Contact Us
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
            <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
              <img
                className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
                src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Modern living space"
              />
            </div>
          </div>
          
          {/* Values Section */}
          <div className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:text-center">
                <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Our Values</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  A better way to find accommodation
                </p>
                <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                  We believe in providing quality, affordable, and safe paying guest accommodations for everyone.
                </p>
              </div>

              <div className="mt-10">
                <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                  <div className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                      <Building className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Quality Accommodations</p>
                    <p className="mt-2 ml-16 text-base text-gray-500">
                      We carefully select and verify all our PG accommodations to ensure they meet our quality standards.
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                      <Shield className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Safety First</p>
                    <p className="mt-2 ml-16 text-base text-gray-500">
                      Safety and security of our customers is our top priority. All PGs have proper security measures.
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                      <Users className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Community</p>
                    <p className="mt-2 ml-16 text-base text-gray-500">
                      We foster a sense of community among residents, creating a home away from home.
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                      <Clock className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Convenience</p>
                    <p className="mt-2 ml-16 text-base text-gray-500">
                      Our online booking and payment system makes finding and securing a PG accommodation quick and easy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Team Section */}
          <div className="bg-white">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
              <div className="lg:text-center">
                <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Our Team</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  Meet the people behind PG Rental
                </p>
                <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                  Our dedicated team works hard to ensure you find the perfect accommodation.
                </p>
              </div>
              
              <div className="mt-10">
                <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                  {/* Team Member 1 */}
                  <div className="text-center">
                    <div className="mx-auto h-40 w-40 rounded-full overflow-hidden">
                      <img 
                        className="h-full w-full object-cover"
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80"
                        alt="Team member"
                      />
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Rahul Sharma</h3>
                      <p className="text-sm text-primary">Founder & CEO</p>
                      <p className="mt-2 text-base text-gray-500">
                        With over 10 years in real estate, Rahul brings expertise and vision to PG Rental.
                      </p>
                    </div>
                  </div>
                  
                  {/* Team Member 2 */}
                  <div className="text-center">
                    <div className="mx-auto h-40 w-40 rounded-full overflow-hidden">
                      <img 
                        className="h-full w-full object-cover"
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
                        alt="Team member"
                      />
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Priya Patel</h3>
                      <p className="text-sm text-primary">Operations Manager</p>
                      <p className="mt-2 text-base text-gray-500">
                        Priya ensures smooth operations and exceptional customer experiences.
                      </p>
                    </div>
                  </div>
                  
                  {/* Team Member 3 */}
                  <div className="text-center">
                    <div className="mx-auto h-40 w-40 rounded-full overflow-hidden">
                      <img 
                        className="h-full w-full object-cover"
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
                        alt="Team member"
                      />
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Amit Kumar</h3>
                      <p className="text-sm text-primary">Property Relations</p>
                      <p className="mt-2 text-base text-gray-500">
                        Amit builds relationships with property owners to expand our PG network.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}