import {
  users, pgLocations, rooms, bookings, payments, amenities, rules, gallery,
  type User, type InsertUser, type PgLocation, type InsertPgLocation, 
  type Room, type InsertRoom, type Booking, type InsertBooking,
  type Payment, type InsertPayment, type Amenity, type InsertAmenity,
  type Rule, type InsertRule, type Gallery, type InsertGallery
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull, not, asc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAdminUsers(): Promise<User[]>;

  // PG Location operations
  getPgLocations(): Promise<PgLocation[]>;
  getPgLocationById(id: number): Promise<PgLocation | undefined>;
  createPgLocation(pgLocation: InsertPgLocation): Promise<PgLocation>;
  updatePgLocation(id: number, pgLocation: Partial<InsertPgLocation>): Promise<PgLocation | undefined>;
  deletePgLocation(id: number): Promise<boolean>;
  
  // Room operations
  getRoomsByPgLocation(pgLocationId: number): Promise<Room[]>;
  getRoomById(id: number): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined>;
  updateRoomStatus(id: number, status: 'Available' | 'Pending' | 'Booked'): Promise<Room | undefined>;
  deleteRoom(id: number): Promise<boolean>;
  
  // Booking operations
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByRoom(roomId: number): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: 'Pending' | 'Confirmed' | 'Cancelled'): Promise<Booking | undefined>;
  
  // Payment operations
  getPaymentsByBooking(bookingId: number): Promise<Payment[]>;
  getPaymentById(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  verifyPayment(id: number, adminId: number): Promise<Payment | undefined>;
  
  // Amenity operations
  getAmenitiesByPgLocation(pgLocationId: number): Promise<Amenity[]>;
  createAmenity(amenity: InsertAmenity): Promise<Amenity>;
  deleteAmenity(id: number): Promise<boolean>;
  
  // Rule operations
  getRulesByPgLocation(pgLocationId: number): Promise<Rule[]>;
  createRule(rule: InsertRule): Promise<Rule>;
  deleteRule(id: number): Promise<boolean>;
  
  // Gallery operations
  getGalleryByPgLocation(pgLocationId: number): Promise<Gallery[]>;
  createGallery(galleryItem: InsertGallery): Promise<Gallery>;
  deleteGallery(id: number): Promise<boolean>;

  // Admin Dashboard operations
  getPendingBookings(): Promise<any[]>;
  getRoomCountByPgLocation(): Promise<any[]>;
  getBookingStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getAdminUsers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, 'admin'));
  }

  // PG Location operations
  async getPgLocations(): Promise<PgLocation[]> {
    return db.select().from(pgLocations);
  }

  async getPgLocationById(id: number): Promise<PgLocation | undefined> {
    const [pgLocation] = await db.select().from(pgLocations).where(eq(pgLocations.id, id));
    return pgLocation;
  }

  async createPgLocation(pgLocation: InsertPgLocation): Promise<PgLocation> {
    const [newPgLocation] = await db.insert(pgLocations).values(pgLocation).returning();
    return newPgLocation;
  }

  async updatePgLocation(id: number, pgLocation: Partial<InsertPgLocation>): Promise<PgLocation | undefined> {
    const [updatedPgLocation] = await db
      .update(pgLocations)
      .set(pgLocation)
      .where(eq(pgLocations.id, id))
      .returning();
    return updatedPgLocation;
  }

  async deletePgLocation(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(pgLocations)
      .where(eq(pgLocations.id, id))
      .returning({ id: pgLocations.id });
    return !!deleted;
  }

  // Room operations
  async getRoomsByPgLocation(pgLocationId: number): Promise<Room[]> {
    return db.select().from(rooms).where(eq(rooms.pgLocationId, pgLocationId));
  }

  async getRoomById(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const [newRoom] = await db.insert(rooms).values(room).returning();
    return newRoom;
  }

  async updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined> {
    const [updatedRoom] = await db
      .update(rooms)
      .set(room)
      .where(eq(rooms.id, id))
      .returning();
    return updatedRoom;
  }

  async updateRoomStatus(id: number, status: 'Available' | 'Pending' | 'Booked'): Promise<Room | undefined> {
    const [updatedRoom] = await db
      .update(rooms)
      .set({ status })
      .where(eq(rooms.id, id))
      .returning();
    return updatedRoom;
  }

  async deleteRoom(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(rooms)
      .where(eq(rooms.id, id))
      .returning({ id: rooms.id });
    return !!deleted;
  }

  // Booking operations
  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return db.select().from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.bookingDate));
  }

  async getBookingsByRoom(roomId: number): Promise<Booking[]> {
    return db.select().from(bookings)
      .where(eq(bookings.roomId, roomId))
      .orderBy(desc(bookings.bookingDate));
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBookingStatus(id: number, status: 'Pending' | 'Confirmed' | 'Cancelled'): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Payment operations
  async getPaymentsByBooking(bookingId: number): Promise<Payment[]> {
    return db.select().from(payments)
      .where(eq(payments.bookingId, bookingId))
      .orderBy(desc(payments.createdAt));
  }

  async getPaymentById(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async verifyPayment(id: number, adminId: number): Promise<Payment | undefined> {
    const [verifiedPayment] = await db
      .update(payments)
      .set({ 
        verifiedByAdmin: true,
        verifiedById: adminId
      })
      .where(eq(payments.id, id))
      .returning();
    return verifiedPayment;
  }

  // Amenity operations
  async getAmenitiesByPgLocation(pgLocationId: number): Promise<Amenity[]> {
    return db.select().from(amenities).where(eq(amenities.pgLocationId, pgLocationId));
  }

  async createAmenity(amenity: InsertAmenity): Promise<Amenity> {
    const [newAmenity] = await db.insert(amenities).values(amenity).returning();
    return newAmenity;
  }

  async deleteAmenity(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(amenities)
      .where(eq(amenities.id, id))
      .returning({ id: amenities.id });
    return !!deleted;
  }

  // Rule operations
  async getRulesByPgLocation(pgLocationId: number): Promise<Rule[]> {
    return db.select().from(rules).where(eq(rules.pgLocationId, pgLocationId));
  }

  async createRule(rule: InsertRule): Promise<Rule> {
    const [newRule] = await db.insert(rules).values(rule).returning();
    return newRule;
  }

  async deleteRule(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(rules)
      .where(eq(rules.id, id))
      .returning({ id: rules.id });
    return !!deleted;
  }

  // Gallery operations
  async getGalleryByPgLocation(pgLocationId: number): Promise<Gallery[]> {
    return db.select().from(gallery).where(eq(gallery.pgLocationId, pgLocationId));
  }

  async createGallery(galleryItem: InsertGallery): Promise<Gallery> {
    const [newGalleryItem] = await db.insert(gallery).values(galleryItem).returning();
    return newGalleryItem;
  }

  async deleteGallery(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(gallery)
      .where(eq(gallery.id, id))
      .returning({ id: gallery.id });
    return !!deleted;
  }

  // Admin Dashboard operations
  async getPendingBookings(): Promise<any[]> {
    const pendingBookings = await db.query.bookings.findMany({
      where: eq(bookings.status, 'Pending'),
      with: {
        user: true,
        room: {
          with: {
            pgLocation: true
          }
        },
        payments: true
      },
      orderBy: desc(bookings.bookingDate)
    });
    
    return pendingBookings;
  }

  async getRoomCountByPgLocation(): Promise<any[]> {
    const pgLocationsWithRooms = await db.query.pgLocations.findMany({
      with: {
        rooms: true
      }
    });

    return pgLocationsWithRooms.map(pg => {
      const availableRooms = pg.rooms.filter(room => room.status === 'Available').length;
      const totalRooms = pg.rooms.length;
      
      return {
        id: pg.id,
        name: pg.name,
        totalRooms,
        availableRooms
      };
    });
  }

  async getBookingStats(): Promise<any> {
    const allBookings = await db.select().from(bookings);
    const pendingBookings = allBookings.filter(booking => booking.status === 'Pending').length;
    const confirmedBookings = allBookings.filter(booking => booking.status === 'Confirmed').length;
    const cancelledBookings = allBookings.filter(booking => booking.status === 'Cancelled').length;
    
    return {
      total: allBookings.length,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      cancelled: cancelledBookings
    };
  }
}

export const storage = new DatabaseStorage();
