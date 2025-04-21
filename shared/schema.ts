import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'admin']);
export const roomStatusEnum = pgEnum('room_status', ['Available', 'Pending', 'Booked']);
export const bookingStatusEnum = pgEnum('booking_status', ['Pending', 'Confirmed', 'Cancelled']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('customer'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

// PG Locations table
export const pgLocations = pgTable("pg_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  mapsUrl: text("maps_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  priceRangeStart: integer("price_range_start").notNull(),
  priceRangeEnd: integer("price_range_end").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pgLocationsRelations = relations(pgLocations, ({ many }) => ({
  rooms: many(rooms),
}));

// Rooms table
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  roomNumber: text("room_number").notNull(),
  pgLocationId: integer("pg_location_id").notNull().references(() => pgLocations.id),
  price: integer("price").notNull(),
  withAttachedBath: boolean("with_attached_bath").notNull(),
  status: roomStatusEnum("status").notNull().default('Available'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  pgLocation: one(pgLocations, {
    fields: [rooms.pgLocationId],
    references: [pgLocations.id],
  }),
  bookings: many(bookings),
}));

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  roomId: integer("room_id").notNull().references(() => rooms.id),
  bookingDate: timestamp("booking_date").defaultNow(),
  status: bookingStatusEnum("status").notNull().default('Pending'),
  notesOrRequests: text("notes_or_requests"),
});

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [bookings.roomId],
    references: [rooms.id],
  }),
  payments: many(payments),
}));

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  amount: integer("amount").notNull(),
  upiReference: text("upi_reference").notNull(),
  screenshotUrl: text("screenshot_url"),
  verifiedByAdmin: boolean("verified_by_admin").default(false),
  verifiedById: integer("verified_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
  verifiedBy: one(users, {
    fields: [payments.verifiedById],
    references: [users.id],
  }),
}));

// Amenities table
export const amenities = pgTable("amenities", {
  id: serial("id").primaryKey(),
  pgLocationId: integer("pg_location_id").notNull().references(() => pgLocations.id),
  name: text("name").notNull(),
  icon: text("icon"),
});

export const amenitiesRelations = relations(amenities, ({ one }) => ({
  pgLocation: one(pgLocations, {
    fields: [amenities.pgLocationId],
    references: [pgLocations.id],
  }),
}));

// Rules table
export const rules = pgTable("rules", {
  id: serial("id").primaryKey(),
  pgLocationId: integer("pg_location_id").notNull().references(() => pgLocations.id),
  description: text("description").notNull(),
  icon: text("icon"),
});

export const rulesRelations = relations(rules, ({ one }) => ({
  pgLocation: one(pgLocations, {
    fields: [rules.pgLocationId],
    references: [pgLocations.id],
  }),
}));

// Gallery table
export const gallery = pgTable("gallery", {
  id: serial("id").primaryKey(),
  pgLocationId: integer("pg_location_id").notNull().references(() => pgLocations.id),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
});

export const galleryRelations = relations(gallery, ({ one }) => ({
  pgLocation: one(pgLocations, {
    fields: [gallery.pgLocationId],
    references: [pgLocations.id],
  }),
}));

// Schema validation
export const insertUserSchema = createInsertSchema(users, {
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // role will default to 'customer'
}).omit({ id: true, createdAt: true });

export const insertPgLocationSchema = createInsertSchema(pgLocations).omit({ id: true, createdAt: true });
export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true, createdAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, bookingDate: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, verifiedByAdmin: true, verifiedById: true });
export const insertAmenitySchema = createInsertSchema(amenities).omit({ id: true });
export const insertRuleSchema = createInsertSchema(rules).omit({ id: true });
export const insertGallerySchema = createInsertSchema(gallery).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PgLocation = typeof pgLocations.$inferSelect;
export type InsertPgLocation = z.infer<typeof insertPgLocationSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Amenity = typeof amenities.$inferSelect;
export type InsertAmenity = z.infer<typeof insertAmenitySchema>;
export type Rule = typeof rules.$inferSelect;
export type InsertRule = z.infer<typeof insertRuleSchema>;
export type Gallery = typeof gallery.$inferSelect;
export type InsertGallery = z.infer<typeof insertGallerySchema>;

// Extended login schema with email instead of username
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
