import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ChevronLeft, AlertTriangle, Upload } from "lucide-react";

const bookingFormSchema = z.object({
  upiReference: z.string().min(1, "UPI reference is required"),
  screenshotUrl: z.string().optional(),
  notesOrRequests: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookingPage() {
  const { roomId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileUrl, setFileUrl] = useState("");

  const { data: roomData, isLoading: isLoadingRoom } = useQuery({
    queryKey: [`/api/room/${roomId}`],
  });

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      upiReference: "",
      screenshotUrl: "",
      notesOrRequests: "",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      return await apiRequest("POST", "/api/book-room", {
        roomId: parseInt(roomId),
        notesOrRequests: data.notesOrRequests,
        payment: {
          amount: roomData.price,
          upiReference: data.upiReference,
          screenshotUrl: data.screenshotUrl || fileUrl,
        },
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: "Booking Successful",
        description: "Your booking has been submitted and is awaiting verification.",
      });
      navigate(`/booking-confirmation/${data.bookingId}`);
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, this would upload the file to a server
      // and get back a URL. For this demo, we'll simulate that process.
      // In production, you would use a file upload service.
      const mockUrl = URL.createObjectURL(file);
      setFileUrl(mockUrl);
      setFileUploaded(true);
      form.setValue("screenshotUrl", mockUrl);
    }
  };

  const onSubmit = async (values: BookingFormValues) => {
    try {
      const response = await fetch('/api/book-room', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });
      
      if (!response.ok) {
        throw new Error('Booking failed');
      }
      
      const data = await response.json();
      bookingMutation.mutate(data);
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  if (isLoadingRoom) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Error</h1>
            <p className="mt-4 text-lg text-gray-500">
              Room not found or not available for booking.
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href={`/pg/${roomData.pgLocation.id}`}>
              <Button variant="outline" size="sm" className="flex items-center">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to room selection
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Book Room #{roomData.roomNumber} - {roomData.pgLocation.name}
              </h2>
              <p className="text-sm text-gray-500 mb-6">Complete the booking process</p>
              
              <div className="space-y-6">
                <Alert variant="warning" className="bg-yellow-50 border-yellow-400">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertTitle className="text-yellow-700">Payment Required</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Please make the payment first and then complete the form below with your payment details.
                  </AlertDescription>
                </Alert>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Instructions</h3>
                  <div className="text-sm text-gray-500 space-y-2">
                    <p>1. Make payment to the following UPI ID:</p>
                    <div className="flex items-center bg-white p-2 rounded border border-gray-300">
                      <span className="font-mono font-medium text-gray-900 flex-grow">anandsl147@okaxis</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary-700 ml-2"
                        onClick={() => {
                          navigator.clipboard.writeText("anandsl147@okaxis");
                          toast({
                            title: "UPI ID copied",
                            description: "UPI ID has been copied to clipboard",
                          });
                        }}
                      >
                        <i className="fas fa-copy"></i>
                      </Button>
                    </div>
                    <p>2. Amount to pay: <span className="font-medium text-gray-900">₹{roomData.price.toLocaleString()}</span></p>
                    <p>3. Save the payment confirmation screenshot or note down the reference number.</p>
                    <p>4. Enter the details in the form below.</p>
                  </div>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="upiReference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UPI Payment Reference ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. 123456789012"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormItem>
                      <FormLabel>Upload Payment Screenshot (Optional)</FormLabel>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {fileUploaded ? (
                            <div className="flex flex-col items-center">
                              <div className="p-2 mb-2 bg-green-50 rounded-full">
                                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <p className="text-sm text-gray-600">File uploaded successfully</p>
                              <Button
                                variant="link"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                  setFileUploaded(false);
                                  setFileUrl("");
                                  form.setValue("screenshotUrl", "");
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                  <span>Upload a file</span>
                                  <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF up to 10MB
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </FormItem>
                    
                    <FormField
                      control={form.control}
                      name="notesOrRequests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special requests or information"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-5">
                      <div className="flex justify-end">
                        <Link href={`/pg/${roomData.pgLocation.id}`}>
                          <Button
                            type="button"
                            variant="outline"
                            className="mr-3"
                          >
                            Cancel
                          </Button>
                        </Link>
                        <Button
                          type="submit"
                          disabled={bookingMutation.isPending}
                        >
                          {bookingMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Complete Booking
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
