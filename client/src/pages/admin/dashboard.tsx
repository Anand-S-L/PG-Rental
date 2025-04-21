import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Check,
  X,
  ExternalLink,
  Building,
  DoorOpen,
  Users,
  BookmarkCheck,
  CreditCard,
} from "lucide-react";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, isLoading: isLoadingUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate("/");
    } else if (!user && !isLoadingUser) {
      navigate("/admin/login");
    }
  }, [user, isLoadingUser, navigate]);

  // Admin stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && user.role === 'admin',
  });

  // Pending bookings
  const { data: pendingBookings, isLoading: isLoadingPendingBookings } = useQuery({
    queryKey: ["/api/admin/pending-bookings"],
    enabled: !!user && user.role === 'admin',
  });

  // PG locations with room stats
  const { data: pgLocations, isLoading: isLoadingPgLocations } = useQuery({
    queryKey: ["/api/admin/pgs"],
    enabled: !!user && user.role === 'admin',
  });

  // Verify payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      return await apiRequest("POST", `/api/admin/verify-payment/${paymentId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Payment verified",
        description: "The payment has been verified and booking confirmed",
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pgs"] });
      setVerifyDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVerifyPayment = () => {
    if (selectedPayment) {
      verifyPaymentMutation.mutate(selectedPayment.id);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary">PG Rental Admin</span>
            </div>
            <div className="flex items-center">
              <div className="text-sm font-medium text-gray-700 mr-4">
                {user.name} <span className="text-gray-500">(Admin)</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
            {/* Sidebar */}
            <div className="lg:col-span-3">
              <AdminSidebar />
            </div>

            {/* Content */}
            <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9 mt-6 lg:mt-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Overview Tab */}
                <TabsContent value="overview">
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Admin Dashboard</h3>
                        <p className="mt-1 text-sm text-gray-500">Overview of all PGs, rooms, and bookings</p>
                      </div>
                      
                      {isLoadingStats ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : stats ? (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                              <Building className="text-gray-500 mr-2 h-5 w-5" />
                              <h4 className="text-base font-medium text-gray-900">Total PGs</h4>
                            </div>
                            <p className="mt-2 text-2xl font-bold text-primary">{stats.pgLocations.length}</p>
                          </div>
                          
                          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                              <DoorOpen className="text-gray-500 mr-2 h-5 w-5" />
                              <h4 className="text-base font-medium text-gray-900">Total Rooms</h4>
                            </div>
                            <p className="mt-2 text-2xl font-bold text-primary">
                              {stats.pgLocations.reduce((sum, pg) => sum + pg.totalRooms, 0)}
                            </p>
                          </div>
                          
                          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                              <Users className="text-gray-500 mr-2 h-5 w-5" />
                              <h4 className="text-base font-medium text-gray-900">Customers</h4>
                            </div>
                            <p className="mt-2 text-2xl font-bold text-gray-800">{stats.customers}</p>
                          </div>
                          
                          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                              <BookmarkCheck className="text-gray-500 mr-2 h-5 w-5" />
                              <h4 className="text-base font-medium text-gray-900">Pending Bookings</h4>
                            </div>
                            <p className="mt-2 text-2xl font-bold text-yellow-500">{stats.bookings.pending}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Error loading statistics. Please try again.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Pending Verifications */}
                  <Card className="mt-6">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Verifications</h3>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab("verifications")}>
                          View All
                        </Button>
                      </div>
                      
                      {isLoadingPendingBookings ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : pendingBookings && pendingBookings.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Customer
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  PG & Room
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Booking Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  UPI Reference
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {pendingBookings.slice(0, 5).map((booking) => {
                                const payment = booking.payments && booking.payments.length > 0 
                                  ? booking.payments[0] 
                                  : null;
                                
                                return (
                                  <tr key={booking.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="text-sm font-medium text-gray-900">
                                          {booking.user.name}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{booking.room.pgLocation.name}</div>
                                      <div className="text-sm text-gray-500">Room #{booking.room.roomNumber}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      ₹{booking.room.price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {payment ? payment.upiReference : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      {payment && (
                                        <div className="flex space-x-2">
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-green-600 hover:text-green-800"
                                            onClick={() => {
                                              setSelectedPayment(payment);
                                              setVerifyDialogOpen(true);
                                            }}
                                          >
                                            <Check className="h-4 w-4 mr-1" /> Verify
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-red-600 hover:text-red-800"
                                            onClick={() => {
                                              setSelectedPayment(payment);
                                              setRejectDialogOpen(true);
                                            }}
                                          >
                                            <X className="h-4 w-4 mr-1" /> Reject
                                          </Button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No pending verifications.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Room Availability */}
                  <Card className="mt-6">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Room Availability</h3>
                        <Button 
                          size="sm"
                          onClick={() => setActiveTab("rooms")}
                        >
                          <DoorOpen className="mr-2 h-4 w-4" /> Add Room
                        </Button>
                      </div>
                      
                      {isLoadingPgLocations ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : pgLocations && pgLocations.length > 0 ? (
                        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                          {pgLocations.map((pg) => (
                            <div key={pg.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">{pg.name}</h3>
                              </div>
                              <div className="p-4">
                                <div className="flex justify-between mb-2">
                                  <div>
                                    <span className="text-sm font-medium text-gray-500">Total Rooms:</span>
                                    <span className="ml-2 text-sm text-gray-900">{pg.totalRooms}</span>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-500">Available:</span>
                                    <span className="ml-2 text-sm text-gray-900">{pg.availableRooms}</span>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                      className="bg-primary h-2.5 rounded-full" 
                                      style={{ width: `${(pg.availableRooms / pg.totalRooms) * 100}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {pg.availableRooms} of {pg.totalRooms} rooms available
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No PG locations found.</p>
                          <Button 
                            className="mt-4"
                            onClick={() => setActiveTab("pgs")}
                          >
                            <Building className="mr-2 h-4 w-4" /> Add PG Location
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Other tabs would be implemented similarly */}
                <TabsContent value="verifications">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">All Pending Verifications</h3>
                      
                      {isLoadingPendingBookings ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : pendingBookings && pendingBookings.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Customer
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  PG & Room
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Booking Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  UPI Reference
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Screenshot
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {pendingBookings.map((booking) => {
                                const payment = booking.payments && booking.payments.length > 0 
                                  ? booking.payments[0] 
                                  : null;
                                
                                return (
                                  <tr key={booking.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="text-sm font-medium text-gray-900">
                                          {booking.user.name}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{booking.room.pgLocation.name}</div>
                                      <div className="text-sm text-gray-500">Room #{booking.room.roomNumber}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      ₹{booking.room.price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {payment ? payment.upiReference : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {payment && payment.screenshotUrl ? (
                                        <a
                                          href={payment.screenshotUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-primary hover:text-primary-700 flex items-center"
                                        >
                                          View <ExternalLink className="ml-1 h-3 w-3" />
                                        </a>
                                      ) : (
                                        'No screenshot'
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      {payment && (
                                        <div className="flex space-x-2">
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="border-green-500 text-green-500 hover:bg-green-50"
                                            onClick={() => {
                                              setSelectedPayment(payment);
                                              setVerifyDialogOpen(true);
                                            }}
                                          >
                                            <Check className="h-4 w-4 mr-1" /> Verify
                                          </Button>
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="border-red-500 text-red-500 hover:bg-red-50"
                                            onClick={() => {
                                              setSelectedPayment(payment);
                                              setRejectDialogOpen(true);
                                            }}
                                          >
                                            <X className="h-4 w-4 mr-1" /> Reject
                                          </Button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No pending verifications found.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Other tabs would be implemented similarly */}
                <TabsContent value="pgs">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Manage PG Locations</h3>
                      <p className="text-gray-500 mb-6">This functionality would be implemented in a real system.</p>
                      <Button>Add New PG Location</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="rooms">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Manage Rooms</h3>
                      <p className="text-gray-500 mb-6">This functionality would be implemented in a real system.</p>
                      <Button>Add New Room</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      {/* Verify Payment Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to verify this payment? This will confirm the booking and mark the room as booked.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">UPI Reference:</span>
                <span className="text-sm text-gray-900">{selectedPayment.upiReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Amount:</span>
                <span className="text-sm text-gray-900">₹{selectedPayment.amount.toLocaleString()}</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVerifyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyPayment}
              disabled={verifyPaymentMutation.isPending}
            >
              {verifyPaymentMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Verify Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Payment Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this payment? This functionality would be implemented in a real system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
