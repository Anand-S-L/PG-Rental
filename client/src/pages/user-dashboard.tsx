import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home,
  User,
  BookOpen,
  CreditCard,
  LogOut,
  Eye,
  Download,
  Loader2
} from "lucide-react";

export default function UserDashboard() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Count bookings by status
  const activeBookings = bookings?.filter(booking => booking.status === 'Confirmed')?.length || 0;
  const pendingBookings = bookings?.filter(booking => booking.status === 'Pending')?.length || 0;
  const totalBookings = bookings?.length || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
            {/* Sidebar */}
            <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab("dashboard")}
                  className={`${
                    activeTab === "dashboard" 
                      ? "bg-gray-50 text-primary" 
                      : "text-gray-900 hover:bg-gray-50 hover:text-primary"
                  } group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full text-left`}
                >
                  <Home className={`${
                    activeTab === "dashboard" 
                      ? "text-primary" 
                      : "text-gray-400 group-hover:text-primary"
                  } mr-3 h-5 w-5`} />
                  <span className="truncate">Dashboard</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab("profile")}
                  className={`${
                    activeTab === "profile" 
                      ? "bg-gray-50 text-primary" 
                      : "text-gray-900 hover:bg-gray-50 hover:text-primary"
                  } group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full text-left`}
                >
                  <User className={`${
                    activeTab === "profile" 
                      ? "text-primary" 
                      : "text-gray-400 group-hover:text-primary"
                  } mr-3 h-5 w-5`} />
                  <span className="truncate">Profile</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab("bookings")}
                  className={`${
                    activeTab === "bookings" 
                      ? "bg-gray-50 text-primary" 
                      : "text-gray-900 hover:bg-gray-50 hover:text-primary"
                  } group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full text-left`}
                >
                  <BookOpen className={`${
                    activeTab === "bookings" 
                      ? "text-primary" 
                      : "text-gray-400 group-hover:text-primary"
                  } mr-3 h-5 w-5`} />
                  <span className="truncate">Bookings</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab("payments")}
                  className={`${
                    activeTab === "payments" 
                      ? "bg-gray-50 text-primary" 
                      : "text-gray-900 hover:bg-gray-50 hover:text-primary"
                  } group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full text-left`}
                >
                  <CreditCard className={`${
                    activeTab === "payments" 
                      ? "text-primary" 
                      : "text-gray-400 group-hover:text-primary"
                  } mr-3 h-5 w-5`} />
                  <span className="truncate">Payments</span>
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="text-gray-900 hover:bg-gray-50 hover:text-primary group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full text-left"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="text-gray-400 group-hover:text-primary mr-3 h-5 w-5" />
                  <span className="truncate">Sign out</span>
                </button>
              </nav>
            </aside>

            {/* Content */}
            <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Dashboard Tab */}
                <TabsContent value="dashboard">
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Welcome, {user.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">Manage your bookings and payments</p>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                          <div className="flex items-center">
                            <Home className="text-gray-500 mr-2 h-5 w-5" />
                            <h4 className="text-base font-medium text-gray-900">Active Bookings</h4>
                          </div>
                          <p className="mt-2 text-2xl font-bold text-primary">{activeBookings}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                          <div className="flex items-center">
                            <CreditCard className="text-gray-500 mr-2 h-5 w-5" />
                            <h4 className="text-base font-medium text-gray-900">Pending Verification</h4>
                          </div>
                          <p className="mt-2 text-2xl font-bold text-yellow-500">{pendingBookings}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                          <div className="flex items-center">
                            <BookOpen className="text-gray-500 mr-2 h-5 w-5" />
                            <h4 className="text-base font-medium text-gray-900">Total Bookings</h4>
                          </div>
                          <p className="mt-2 text-2xl font-bold text-gray-800">{totalBookings}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Recent Bookings Section */}
                  <Card className="mt-6">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab("bookings")}>
                          View All
                        </Button>
                      </div>
                      
                      {isLoadingBookings ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : bookings && bookings.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  PG Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Room
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Booking Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {bookings.slice(0, 3).map((booking) => (
                                <tr key={booking.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {booking.pgLocation.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    #{booking.room.roomNumber}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={booking.status} />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <Link href={`/booking-confirmation/${booking.id}`}>
                                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary-700">
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                      </Button>
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">You haven't made any bookings yet.</p>
                          <Link href="/">
                            <Button className="mt-4">
                              Browse PG Accommodations
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Profile Tab */}
                <TabsContent value="profile">
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
                        <p className="mt-1 text-sm text-gray-500">Your personal details</p>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-6">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Full name</dt>
                            <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Email address</dt>
                            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Account type</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <Button>
                          Update Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Bookings Tab */}
                <TabsContent value="bookings">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Your Bookings</h3>
                        <Link href="/">
                          <Button size="sm">
                            New Booking
                          </Button>
                        </Link>
                      </div>
                      
                      {isLoadingBookings ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : bookings && bookings.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  PG Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Room
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Booking Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {bookings.map((booking) => (
                                <tr key={booking.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {booking.pgLocation.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    #{booking.room.roomNumber}
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
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={booking.status} />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <Link href={`/booking-confirmation/${booking.id}`}>
                                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary-700">
                                        View
                                      </Button>
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">You haven't made any bookings yet.</p>
                          <Link href="/">
                            <Button className="mt-4">
                              Browse PG Accommodations
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Payments Tab */}
                <TabsContent value="payments">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Payment History</h3>
                      
                      {isLoadingBookings ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : bookings && bookings.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Room
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  UPI Reference
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Receipt
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {bookings
                                .filter(booking => booking.payments && booking.payments.length > 0)
                                .map((booking) => (
                                  booking.payments.map((payment) => (
                                    <tr key={payment.id}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric'
                                        })}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {booking.pgLocation.name} #{booking.room.roomNumber}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ₹{payment.amount.toLocaleString()}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {payment.upiReference}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge 
                                          status={payment.verifiedByAdmin ? 'Verified' : 'Pending'} 
                                        />
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {payment.screenshotUrl && (
                                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary-700">
                                            <Download className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No payment records found.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
