import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin, IndianRupee } from "lucide-react";

interface PgCardProps {
  id: number;
  name: string;
  description: string;
  location: string;
  priceRangeStart: number;
  priceRangeEnd: number;
  availableRooms: number;
  totalRooms: number;
  thumbnailUrl: string;
}

export default function PgCard({
  id,
  name,
  description,
  location,
  priceRangeStart,
  priceRangeEnd,
  availableRooms,
  totalRooms,
  thumbnailUrl
}: PgCardProps) {
  return (
    <Card className="flex flex-col rounded-lg shadow-lg overflow-hidden h-full">
      <div className="flex-shrink-0">
        <img 
          className="h-48 w-full object-cover" 
          src={thumbnailUrl || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80"} 
          alt={`${name} interior view`} 
        />
      </div>
      <CardContent className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold text-gray-900">
              {name}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
              {availableRooms} rooms available
            </span>
          </div>
          <p className="mt-3 text-base text-gray-500 line-clamp-2">
            {description}
          </p>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 text-gray-400 mr-1" />
              {location}
            </div>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <IndianRupee className="h-4 w-4 text-gray-400 mr-1" />
              ₹{priceRangeStart.toLocaleString()} - ₹{priceRangeEnd.toLocaleString()} per month
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center">
          <div className="flex-1 flex-col sm:flex-row sm:flex sm:justify-between">
            <Link href={`/pg/${id}`}>
              <Button variant="outline" className="w-full sm:w-auto">
                View Details
              </Button>
            </Link>
            <Link href={`/pg/${id}`}>
              <Button className="mt-3 sm:mt-0 w-full sm:w-auto">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
