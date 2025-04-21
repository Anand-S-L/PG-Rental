import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "wouter";

interface RoomCardProps {
  id: number;
  roomNumber: string;
  price: number;
  withAttachedBath: boolean;
  status: 'Available' | 'Pending' | 'Booked';
}

export default function RoomCard({
  id,
  roomNumber,
  price,
  withAttachedBath,
  status
}: RoomCardProps) {
  return (
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <CardContent className="p-5">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-gray-900">Room #{roomNumber}</h4>
          <StatusBadge status={status} />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Room with {withAttachedBath ? "attached" : "shared"} bathroom
        </p>
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
            <span className="text-sm text-gray-500">per month</span>
          </div>
        </div>
        <div className="mt-5">
          {status === 'Available' ? (
            <Link href={`/booking/${id}`}>
              <Button className="w-full">
                Book Now
              </Button>
            </Link>
          ) : (
            <Button className="w-full" disabled variant="secondary">
              {status === 'Pending' ? 'Pending Verification' : 'Unavailable'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
