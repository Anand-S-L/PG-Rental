import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Loader2,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";

// Room form schema
const roomFormSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  pgLocationId: z.string().min(1, "PG location is required"),
  price: z.string().min(1, "Price is required").transform(val => parseInt(val)),
  withAttachedBath: z.boolean().default(false),
  status: z.enum(["Available", "Pending", "Booked"]).default("Available"),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

export default function AdminRoomsPage() {
  const [, navigate] = useLocation();
  const { user, isLoading: isLoadingUser } = useAuth();
  const { toast } = useToast();
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [editRoomOpen, setEditRoomOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  
  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate("/");
    } else if (!user && !isLoadingUser) {
      navigate("/admin/login");
    }
  }, [user, isLoadingUser, navigate]);
  
  // Get PG locations
  const { data: pgLocations, isLoading: isLoadingPGs } = useQuery({
    queryKey: ["/api/locations"],
    enabled: !!user && user.role === 'admin',
  });
  
  // Get all rooms across all PG locations
  const { data: allRooms, isLoading: isLoadingRooms } = useQuery({
    queryKey: ["/api/admin/rooms"],
    enabled: !!user && user.role === 'admin',
  });
  
  // Form for adding new room
  const addRoomForm = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      roomNumber: "",
      pgLocationId: "",
      price: "",
      withAttachedBath: false,
      status: "Available",
    },
  });
  
  // Form for editing room
  const editRoomForm = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      roomNumber: "",
      pgLocationId: "",
      price: "",
      withAttachedBath: false,
      status: "Available",
    },
  });
  
  // Mutation for adding a new room
  const addRoomMutation = useMutation({
    mutationFn: async (data: RoomFormValues) => {
      const response = await apiRequest("POST", "/api/admin/add-room", {
        roomNumber: data.roomNumber,
        pgLocationId: parseInt(data.pgLocationId),
        price: data.price,
        withAttachedBath: data.withAttachedBath,
        status: data.status,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Room Added",
        description: "The room has been added successfully",
      });
      setAddRoomOpen(false);
      addRoomForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pgs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for updating a room
  const updateRoomMutation = useMutation({
    mutationFn: async (data: { id: number; values: RoomFormValues }) => {
      const response = await apiRequest("PUT", `/api/admin/update-room/${data.id}`, {
        roomNumber: data.values.roomNumber,
        pgLocationId: parseInt(data.values.pgLocationId),
        price: data.values.price,
        withAttachedBath: data.values.withAttachedBath,
        status: data.values.status,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Room Updated",
        description: "The room has been updated successfully",
      });
      setEditRoomOpen(false);
      editRoomForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pgs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission for new room
  const onAddRoomSubmit = (values: RoomFormValues) => {
    addRoomMutation.mutate(values);
  };
  
  // Handle form submission for editing room
  const onEditRoomSubmit = (values: RoomFormValues) => {
    if (selectedRoom) {
      updateRoomMutation.mutate({ id: selectedRoom.id, values });
    }
  };
  
  const handleEditRoom = (room: any) => {
    setSelectedRoom(room);
    editRoomForm.reset({
      roomNumber: room.roomNumber,
      pgLocationId: room.pgLocationId.toString(),
      price: room.price.toString(),
      withAttachedBath: room.withAttachedBath,
      status: room.status,
    });
    setEditRoomOpen(true);
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
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Manage Rooms</h1>
                <Button onClick={() => setAddRoomOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Room
                </Button>
              </div>
              
              {isLoadingRooms || isLoadingPGs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : allRooms && allRooms.length > 0 ? (
                <div className="bg-white shadow rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PG Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Room Number
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attached Bath
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allRooms.map((room: any) => (
                        <tr key={room.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {room.pgLocation?.name || "Unknown"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              #{room.roomNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              ₹{room.price.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {room.withAttachedBath ? "Yes" : "No"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={room.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => handleEditRoom(room)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <p className="text-gray-500 mb-4">No rooms found. Add your first room.</p>
                    <Button onClick={() => setAddRoomOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Room
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Add Room Dialog */}
              <Dialog open={addRoomOpen} onOpenChange={setAddRoomOpen}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Room</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new room. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...addRoomForm}>
                    <form onSubmit={addRoomForm.handleSubmit(onAddRoomSubmit)} className="space-y-4 py-4">
                      <FormField
                        control={addRoomForm.control}
                        name="pgLocationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PG Location</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a PG location" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {pgLocations?.map((pg: any) => (
                                  <SelectItem key={pg.id} value={pg.id.toString()}>
                                    {pg.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addRoomForm.control}
                        name="roomNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 101" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addRoomForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹ per month)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 10000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addRoomForm.control}
                        name="withAttachedBath"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Attached Bathroom</FormLabel>
                              <FormDescription>
                                Does this room have an attached bathroom?
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addRoomForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select room status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Available">Available</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Booked">Booked</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAddRoomOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={addRoomMutation.isPending}
                        >
                          {addRoomMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Save Room
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              {/* Edit Room Dialog */}
              <Dialog open={editRoomOpen} onOpenChange={setEditRoomOpen}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit Room</DialogTitle>
                    <DialogDescription>
                      Update the room details. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...editRoomForm}>
                    <form onSubmit={editRoomForm.handleSubmit(onEditRoomSubmit)} className="space-y-4 py-4">
                      <FormField
                        control={editRoomForm.control}
                        name="pgLocationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PG Location</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a PG location" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {pgLocations?.map((pg: any) => (
                                  <SelectItem key={pg.id} value={pg.id.toString()}>
                                    {pg.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editRoomForm.control}
                        name="roomNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 101" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editRoomForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹ per month)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 10000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editRoomForm.control}
                        name="withAttachedBath"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Attached Bathroom</FormLabel>
                              <FormDescription>
                                Does this room have an attached bathroom?
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editRoomForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select room status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Available">Available</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Booked">Booked</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditRoomOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={updateRoomMutation.isPending}
                        >
                          {updateRoomMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}