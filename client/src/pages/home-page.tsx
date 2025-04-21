import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PgCard from "@/components/pg-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: pgLocations, isLoading, error } = useQuery({
    queryKey: ["/api/locations"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality if needed
  };

  const filteredLocations = pgLocations
    ? pgLocations.filter((pg: any) => 
        pg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pg.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Find Your Perfect PG Accommodation
              </h1>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                Browse our selection of quality PG accommodations in prime locations
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-8">
              <div className="max-w-lg mx-auto">
                <form onSubmit={handleSearch} className="flex shadow-sm rounded-md">
                  <div className="relative flex-grow">
                    <Input
                      type="text"
                      className="block w-full rounded-l-md border-gray-300 pl-10 pr-3 py-2 text-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Search by location, price range..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <Button type="submit" className="rounded-l-none">
                    Search
                  </Button>
                </form>
              </div>
            </div>

            {/* PG Listings */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">Error loading PG locations. Please try again later.</p>
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No PG locations found matching your search.</p>
              </div>
            ) : (
              <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
                {filteredLocations.map((pg: any) => (
                  <PgCard
                    key={pg.id}
                    id={pg.id}
                    name={pg.name}
                    description={pg.description}
                    location={pg.address}
                    priceRangeStart={pg.priceRangeStart}
                    priceRangeEnd={pg.priceRangeEnd}
                    availableRooms={pg.availableRooms}
                    totalRooms={pg.totalRooms}
                    thumbnailUrl={pg.thumbnailUrl}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
