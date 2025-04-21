import { db } from "./db";
import { pgLocations, rooms, amenities, rules, gallery, users } from "@shared/schema";
import { hashPassword } from "./auth";

async function seed() {
  console.log("Starting database seeding...");
  
  try {
    // Create admin user
    const adminPassword = await hashPassword("admin123");
    const [admin] = await db.insert(users).values({
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: "admin",
    }).returning();
    
    console.log("Created admin user:", admin.email);
    
    // Create regular user
    const userPassword = await hashPassword("user123");
    const [regularUser] = await db.insert(users).values({
      name: "Demo User",
      email: "user@example.com",
      password: userPassword,
      role: "customer",
    }).returning();
    
    console.log("Created regular user:", regularUser.email);
    
    // Create PG locations
    const pgLocationsData = [
      {
        name: "Green Park PG",
        description: "A modern PG accommodation with all basic amenities in a prime location, perfect for students and working professionals.",
        address: "123 Green Park Road, Bangalore",
        mapsUrl: "https://maps.google.com/?q=123+Green+Park+Road+Bangalore",
        thumbnailUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        priceRangeStart: 8000,
        priceRangeEnd: 15000,
      },
      {
        name: "Urban Stay PG",
        description: "Luxurious PG accommodation with premium amenities, including gym, recreation room, and high-speed WiFi.",
        address: "45 Urban Heights, HSR Layout, Bangalore",
        mapsUrl: "https://maps.google.com/?q=45+Urban+Heights+HSR+Layout+Bangalore",
        thumbnailUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80",
        priceRangeStart: 10000,
        priceRangeEnd: 18000,
      },
      {
        name: "Comfort Zone PG",
        description: "Affordable and comfortable PG with homely environment, nutritious meals, and essential amenities for a pleasant stay.",
        address: "78 Comfort Lane, Koramangala, Bangalore",
        mapsUrl: "https://maps.google.com/?q=78+Comfort+Lane+Koramangala+Bangalore",
        thumbnailUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
        priceRangeStart: 7000,
        priceRangeEnd: 14000,
      },
      {
        name: "Campus View PG",
        description: "Located near major colleges and tech parks, offering convenient access to educational institutions and workplaces.",
        address: "23 Campus Road, Whitefield, Bangalore",
        mapsUrl: "https://maps.google.com/?q=23+Campus+Road+Whitefield+Bangalore",
        thumbnailUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        priceRangeStart: 9000,
        priceRangeEnd: 16000,
      },
    ];
    
    const createdPGs = [];
    
    for (const pgData of pgLocationsData) {
      const [pg] = await db.insert(pgLocations).values(pgData).returning();
      console.log(`Created PG: ${pg.name}`);
      createdPGs.push(pg);
      
      // Add rooms for each PG
      const roomsCount = Math.floor(Math.random() * 5) + 5; // 5-10 rooms per PG
      
      for (let i = 1; i <= roomsCount; i++) {
        const hasAttachedBath = Math.random() > 0.5;
        const price = hasAttachedBath 
          ? pg.priceRangeStart + Math.floor(Math.random() * (pg.priceRangeEnd - pg.priceRangeStart))
          : pg.priceRangeStart;
          
        await db.insert(rooms).values({
          roomNumber: `${i < 10 ? '0' : ''}${i}`,
          pgLocationId: pg.id,
          price,
          withAttachedBath: hasAttachedBath,
          status: 'Available',
        });
      }
      console.log(`Added ${roomsCount} rooms to ${pg.name}`);
      
      // Add amenities
      const pgAmenities = [
        { name: "WiFi", icon: "wifi" },
        { name: "Power Backup", icon: "zap" },
        { name: "Laundry", icon: "shirt" },
        { name: "Security", icon: "shield" },
        { name: "Meals", icon: "utensils" },
        { name: "Parking", icon: "car" },
        { name: "TV Room", icon: "tv" },
      ];
      
      // Add 4-6 random amenities
      const amenitiesCount = Math.floor(Math.random() * 3) + 4;
      const shuffledAmenities = [...pgAmenities].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < amenitiesCount; i++) {
        await db.insert(amenities).values({
          pgLocationId: pg.id,
          name: shuffledAmenities[i].name,
          icon: shuffledAmenities[i].icon,
        });
      }
      
      // Add rules
      const pgRules = [
        { description: "No smoking inside the premises", icon: "cigarette-off" },
        { description: "No loud music after 10 PM", icon: "volume-x" },
        { description: "Guests allowed only until 8 PM", icon: "users" },
        { description: "Keep common areas clean", icon: "trash" },
        { description: "No cooking in rooms", icon: "flame" },
        { description: "Rent due by 5th of every month", icon: "calendar" },
      ];
      
      // Add 3-5 random rules
      const rulesCount = Math.floor(Math.random() * 3) + 3;
      const shuffledRules = [...pgRules].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < rulesCount; i++) {
        await db.insert(rules).values({
          pgLocationId: pg.id,
          description: shuffledRules[i].description,
          icon: shuffledRules[i].icon,
        });
      }
      
      // Add gallery images
      const galleryImages = [
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1531835551805-16d864c8d311?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
      ];
      
      const captions = [
        "Room Interior",
        "Common Area",
        "Bathroom",
        "Kitchen",
        "Recreation Area",
      ];
      
      for (let i = 0; i < galleryImages.length; i++) {
        await db.insert(gallery).values({
          pgLocationId: pg.id,
          imageUrl: galleryImages[i],
          caption: captions[i],
        });
      }
    }
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed function
seed();