import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { rooms } from "@shared/schema";

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

// Middleware to check if user is admin
function isAdmin(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: "Admin access required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // PG Locations routes
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getPgLocations();
      
      // For each location, get available room count
      const locationsWithRoomCount = await Promise.all(
        locations.map(async (location) => {
          const rooms = await storage.getRoomsByPgLocation(location.id);
          const availableRooms = rooms.filter(room => room.status === 'Available').length;
          
          return {
            ...location,
            availableRooms,
            totalRooms: rooms.length
          };
        })
      );
      
      res.json(locationsWithRoomCount);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid location ID" });
      }
      
      const location = await storage.getPgLocationById(id);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      // Get rooms for this location
      const rooms = await storage.getRoomsByPgLocation(id);
      
      // Get amenities
      const amenities = await storage.getAmenitiesByPgLocation(id);
      
      // Get rules
      const rules = await storage.getRulesByPgLocation(id);
      
      // Get gallery images
      const gallery = await storage.getGalleryByPgLocation(id);
      
      res.json({
        ...location,
        rooms,
        amenities,
        rules,
        gallery
      });
    } catch (error) {
      console.error("Error fetching location details:", error);
      res.status(500).json({ message: "Failed to fetch location details" });
    }
  });

  // Rooms routes
  app.get("/api/rooms/:locationId", async (req, res) => {
    try {
      const locationId = parseInt(req.params.locationId);
      if (isNaN(locationId)) {
        return res.status(400).json({ message: "Invalid location ID" });
      }
      
      const rooms = await storage.getRoomsByPgLocation(locationId);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.get("/api/room/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid room ID" });
      }
      
      const room = await storage.getRoomById(id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      // Get the PG location for this room
      const pgLocation = await storage.getPgLocationById(room.pgLocationId);
      
      res.json({
        ...room,
        pgLocation
      });
    } catch (error) {
      console.error("Error fetching room details:", error);
      res.status(500).json({ message: "Failed to fetch room details" });
    }
  });

  // Booking routes
  app.post("/api/book-room", isAuthenticated, async (req, res) => {
    console.log("Session user:", req.user);
    try {
      const schema = z.object({
        roomId: z.number(),
        notesOrRequests: z.string().optional(),
        payment: z.object({
          amount: z.number(),
          upiReference: z.string(),
          screenshotUrl: z.string().optional()
        })
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid booking data", 
          errors: result.error.errors 
        });
      }
      
      const { roomId, notesOrRequests, payment } = result.data;
      
      // Check if room exists and is available
      const room = await storage.getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      if (room.status !== 'Available') {
        return res.status(400).json({ message: "Room is not available for booking" });
      }
      
      // Start a transaction
      const booking = await db.transaction(async (tx) => {
        // 1. Create booking
        const booking = await storage.createBooking({
          userId: req.user.id,
          roomId,
          status: 'Pending',
          notesOrRequests
        });
        
        // 2. Update room status to Pending
        await storage.updateRoomStatus(roomId, 'Pending');
        
        // 3. Create payment record
        await storage.createPayment({
          bookingId: booking.id,
          amount: payment.amount,
          upiReference: payment.upiReference,
          screenshotUrl: payment.screenshotUrl,
        });
        
        return booking;
      });
      
      res.status(201).json({
        bookingId: booking.id,
        status: booking.status,
        message: "Booking submitted successfully and awaiting payment verification"
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Get user bookings
  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getBookingsByUser(req.user.id);
      
      // Enrich the bookings with room and payment details
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const room = await storage.getRoomById(booking.roomId);
          const pgLocation = room ? await storage.getPgLocationById(room.pgLocationId) : null;
          const payments = await storage.getPaymentsByBooking(booking.id);
          
          return {
            ...booking,
            room,
            pgLocation,
            payments
          };
        })
      );
      
      res.json(enrichedBookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get booking details
  app.get("/api/booking/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      const booking = await storage.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Only allow user to see their own bookings unless they're an admin
      if (booking.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get related data
      const room = await storage.getRoomById(booking.roomId);
      const pgLocation = room ? await storage.getPgLocationById(room.pgLocationId) : null;
      const payments = await storage.getPaymentsByBooking(booking.id);
      
      res.json({
        ...booking,
        room,
        pgLocation,
        payments
      });
    } catch (error) {
      console.error("Error fetching booking details:", error);
      res.status(500).json({ message: "Failed to fetch booking details" });
    }
  });

  // Upload payment
  app.post("/api/upload-payment", isAuthenticated, async (req, res) => {
    try {
      const schema = z.object({
        bookingId: z.number(),
        amount: z.number(),
        upiReference: z.string(),
        screenshotUrl: z.string().optional()
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid payment data", 
          errors: result.error.errors 
        });
      }
      
      const { bookingId, amount, upiReference, screenshotUrl } = result.data;
      
      // Check if booking exists and belongs to user
      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Create payment record
      const payment = await storage.createPayment({
        bookingId,
        amount,
        upiReference,
        screenshotUrl
      });
      
      res.status(201).json({
        paymentId: payment.id,
        message: "Payment information submitted successfully and awaiting verification"
      });
    } catch (error) {
      console.error("Error uploading payment:", error);
      res.status(500).json({ message: "Failed to upload payment information" });
    }
  });

  // Admin routes (all require admin authentication)
  
  // Get all PGs with room stats
  app.get("/api/admin/pgs", isAdmin, async (req, res) => {
    try {
      const roomStats = await storage.getRoomCountByPgLocation();
      res.json(roomStats);
    } catch (error) {
      console.error("Error fetching PG stats:", error);
      res.status(500).json({ message: "Failed to fetch PG statistics" });
    }
  });

  // Get all rooms for admin
  app.get("/api/admin/rooms", isAdmin, async (req, res) => {
    try {
      // Use storage implementation to avoid direct DB schema reference
      const allRooms = await storage.getRoomsByPgLocation(0); // 0 means all rooms
      
      // Get PG location for each room
      const enrichedRooms = await Promise.all(
        allRooms.map(async (room) => {
          const pgLocation = await storage.getPgLocationById(room.pgLocationId);
          return {
            ...room,
            pgLocation,
          };
        })
      );
      
      res.json(enrichedRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  // Add a new PG
  app.post("/api/admin/add-pg", isAdmin, async (req, res) => {
    try {
      const pgResult = await storage.createPgLocation(req.body);
      res.status(201).json(pgResult);
    } catch (error) {
      console.error("Error adding PG:", error);
      res.status(500).json({ message: "Failed to add PG" });
    }
  });

  // Add a new room
  app.post("/api/admin/add-room", isAdmin, async (req, res) => {
    try {
      const roomResult = await storage.createRoom(req.body);
      res.status(201).json(roomResult);
    } catch (error) {
      console.error("Error adding room:", error);
      res.status(500).json({ message: "Failed to add room" });
    }
  });

  // Update a room
  app.put("/api/admin/update-room/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid room ID" });
      }
      
      const updatedRoom = await storage.updateRoom(id, req.body);
      if (!updatedRoom) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      res.json(updatedRoom);
    } catch (error) {
      console.error("Error updating room:", error);
      res.status(500).json({ message: "Failed to update room" });
    }
  });

  // Get all pending bookings for verification
  app.get("/api/admin/pending-bookings", isAdmin, async (req, res) => {
    try {
      const pendingBookings = await storage.getPendingBookings();
      res.json(pendingBookings);
    } catch (error) {
      console.error("Error fetching pending bookings:", error);
      res.status(500).json({ message: "Failed to fetch pending bookings" });
    }
  });

  // Verify a payment
  app.post("/api/admin/verify-payment/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid payment ID" });
      }
      
      // Get the payment
      const payment = await storage.getPaymentById(id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Get the booking
      const booking = await storage.getBookingById(payment.bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Get the room
      const room = await storage.getRoomById(booking.roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      // Start a transaction
      await db.transaction(async (tx) => {
        // 1. Update payment status
        await storage.verifyPayment(id, req.user.id);
        
        // 2. Update booking status
        await storage.updateBookingStatus(booking.id, 'Confirmed');
        
        // 3. Update room status
        await storage.updateRoomStatus(room.id, 'Booked');
      });
      
      res.json({ 
        message: "Payment verified successfully, booking confirmed",
        roomId: room.id,
        bookingId: booking.id,
        paymentId: payment.id
      });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Get admin dashboard stats
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      // Get booking stats
      const bookingStats = await storage.getBookingStats();
      
      // Get room stats by PG
      const roomStats = await storage.getRoomCountByPgLocation();
      
      // Get count of users
      const users = await db.select().from(db.schema.users).catch(() => {
        // Fallback if schema not found
        return storage.getAdminUsers();
      });
      const customerCount = users ? users.filter(user => user.role === 'customer').length : 0;
      
      res.json({
        bookings: bookingStats,
        pgLocations: roomStats,
        customers: customerCount
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
