import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import RoomCard from "@/components/room-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChevronLeft, MapPin, ExternalLink } from "lucide-react";

export default function PgDetailsPage() {
  const { id } = useParams();
  
  const { data: pgDetails, isLoading, error } = useQuery({
    queryKey: [`/api/locations/${id}`],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pgDetails) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Error</h1>
            <p className="mt-4 text-lg text-gray-500">
              Failed to load PG details. Please try again later.
            </p>
            <Link href="/">
              <Button className="mt-6">
                Back to Home
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const availableRooms = pgDetails.rooms.filter(room => room.status === 'Available').length;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to listings
              </Button>
            </Link>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {pgDetails.name}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">{pgDetails.address}</p>
              </div>
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
                  {availableRooms} rooms available
                </span>
              </div>
            </div>
            
            {/* PG Gallery */}
            <div className="border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
                {pgDetails.gallery && pgDetails.gallery.length > 0 ? (
                  pgDetails.gallery.slice(0, 3).map((img, index) => (
                    <img
                      key={index}
                      src={img.imageUrl}
                      alt={img.caption || `${pgDetails.name} view ${index + 1}`}
                      className="h-48 w-full object-cover rounded-lg"
                    />
                  ))
                ) : (
                  <>
                    <img
                      src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80"
                      alt="PG room"
                      className="h-48 w-full object-cover rounded-lg"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80"
                      alt="PG bathroom"
                      className="h-48 w-full object-cover rounded-lg"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80"
                      alt="PG common area"
                      className="h-48 w-full object-cover rounded-lg"
                    />
                  </>
                )}
              </div>
            </div>
            
            {/* PG Details */}
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Location
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{pgDetails.address}</span>
                      {pgDetails.mapsUrl && (
                        <a 
                          href={pgDetails.mapsUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="ml-2 text-primary hover:text-primary-700 flex items-center"
                        >
                          View on Google Maps
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {pgDetails.description}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Amenities
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {pgDetails.amenities && pgDetails.amenities.length > 0 ? (
                        pgDetails.amenities.map((amenity) => (
                          <li key={amenity.id} className="pl-3 pr-4 py-3 flex items-center justify-start text-sm">
                            <span className="w-4 h-4 flex items-center justify-center mr-2 text-gray-500">
                              {amenity.icon ? (
                                <i className={amenity.icon}></i>
                              ) : (
                                <i className="fas fa-check"></i>
                              )}
                            </span>
                            {amenity.name}
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="pl-3 pr-4 py-3 flex items-center justify-start text-sm">
                            <span className="w-4 h-4 flex items-center justify-center mr-2 text-gray-500">
                              <i className="fas fa-motorcycle"></i>
                            </span>
                            2-wheeler parking
                          </li>
                          <li className="pl-3 pr-4 py-3 flex items-center justify-start text-sm">
                            <span className="w-4 h-4 flex items-center justify-center mr-2 text-gray-500">
                              <i className="fas fa-hospital"></i>
                            </span>
                            Near hospitals/schools
                          </li>
                          <li className="pl-3 pr-4 py-3 flex items-center justify-start text-sm">
                            <span className="w-4 h-4 flex items-center justify-center mr-2 text-gray-500">
                              <i className="fas fa-road"></i>
                            </span>
                            Main road access
                          </li>
                        </>
                      )}
                    </ul>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Rules
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {pgDetails.rules && pgDetails.rules.length > 0 ? (
                        pgDetails.rules.map((rule) => (
                          <li key={rule.id} className="pl-3 pr-4 py-3 flex items-center justify-start text-sm">
                            <span className="w-4 h-4 flex items-center justify-center mr-2 text-gray-500">
                              {rule.icon ? (
                                <i className={rule.icon}></i>
                              ) : (
                                <i className="fas fa-info-circle"></i>
                              )}
                            </span>
                            {rule.description}
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="pl-3 pr-4 py-3 flex items-center justify-start text-sm">
                            <span className="w-4 h-4 flex items-center justify-center mr-2 text-gray-500">
                              <i className="fas fa-male"></i>
                            </span>
                            Bachelors only
                          </li>
                          <li className="pl-3 pr-4 py-3 flex items-center justify-start text-sm">
                            <span className="w-4 h-4 flex items-center justify-center mr-2 text-gray-500">
                              <i className="fas fa-motorcycle"></i>
                            </span>
                            2-wheelers allowed
                          </li>
                          <li className="pl-3 pr-4 py-3 flex items-center justify-start text-sm">
                            <span className="w-4 h-4 flex items-center justify-center mr-2 text-gray-500">
                              <i className="fas fa-car"></i>
                            </span>
                            No cars allowed
                          </li>
                        </>
                      )}
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Available Rooms */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Available Rooms</h3>
            <div className="mt-4 grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {pgDetails.rooms && pgDetails.rooms.length > 0 ? (
                pgDetails.rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    id={room.id}
                    roomNumber={room.roomNumber}
                    price={room.price}
                    withAttachedBath={room.withAttachedBath}
                    status={room.status}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">No rooms available at this location.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
