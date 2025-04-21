import { useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  CheckCircle, 
  Home, 
  Mail
} from "lucide-react";

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const [, navigate] = useLocation();

  const { data: bookingDetails, isLoading, error } = useQuery({
    queryKey: [`/api/booking/${bookingId}`],
  });

  // Redirect if no booking ID
  useEffect(() => {
    if (!bookingId) {
      navigate("/dashboard");
    }
  }, [bookingId, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Error</h1>
            <p className="mt-4 text-lg text-gray-500">
              Failed to load booking details. Please check your dashboard for booking status.
            </p>
            <Link href="/dashboard">
              <Button className="mt-6">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { room, pgLocation, payments } = bookingDetails;
  const payment = payments && payments.length > 0 ? payments[0] : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-green-50 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Booking submitted successfully</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your booking request has been submitted and is awaiting payment verification by the admin.</p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <Link href="/dashboard">
                      <Button variant="outline" className="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 border-green-200">
                        View your dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Booking Details
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Reference: #{bookingId}
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-500">PG Name</div>
                  <div className="text-sm text-gray-900 col-span-2">{pgLocation.name}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-500">Room Number</div>
                  <div className="text-sm text-gray-900 col-span-2">#{room.roomNumber}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-500">Amount Paid</div>
                  <div className="text-sm text-gray-900 col-span-2">
                    ₹{payment ? payment.amount.toLocaleString() : room.price.toLocaleString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-500">Payment Reference</div>
                  <div className="text-sm text-gray-900 col-span-2">
                    UPI Ref: {payment ? payment.upiReference : 'Not available'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className="text-sm text-gray-900 col-span-2">
                    <StatusBadge status={bookingDetails.status} />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-3">
                  <div className="text-sm font-medium text-gray-500">Booking Date</div>
                  <div className="text-sm text-gray-900 col-span-2">
                    {new Date(bookingDetails.bookingDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Have questions? Contact us at <a href="mailto:support@pgrental.com" className="text-primary hover:text-primary-700">support@pgrental.com</a>
            </p>
            <div className="mt-4 space-x-4">
              <Link href="/">
                <Button variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button>
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
