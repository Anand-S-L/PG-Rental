// Sample PG data
const { v4: uuidv4 } = require('uuid');

const samplePGs = [
  {
    id: uuidv4(),
    title: "Sunset PG for Men",
    description: "Comfortable and affordable PG accommodation for men, located near IT hubs. We provide fully furnished rooms with all basic amenities and home-cooked meals.",
    location: "Koramangala, Bangalore",
    address: "123 5th Block, Koramangala, Bangalore - 560034",
    priceRange: "8,000 - 15,000",
    roomTypes: [
      {
        type: "Single Room",
        price: 15000,
        availability: 2,
        description: "Private room with attached bathroom"
      },
      {
        type: "Double Sharing",
        price: 12000,
        availability: 3,
        description: "Shared room with common bathroom"
      },
      {
        type: "Triple Sharing",
        price: 8000,
        availability: 5,
        description: "Economical option with shared facilities"
      }
    ],
    amenities: [
      "WiFi", "AC", "Geyser", "Power Backup", "TV", "Refrigerator", 
      "Washing Machine", "Security", "CCTV", "Food"
    ],
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf"
    ],
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.7686570818314!2d77.63028001482139!3d12.9348528909353!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae14783d9c29a7%3A0x92bbd8ee9ccfc2a7!2sKoramangala%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1628162585825!5m2!1sen!2sin",
    contactNumber: "9876543210",
    contactEmail: "sunsetpg@example.com",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    title: "Green Valley Women's PG",
    description: "A safe and comfortable PG for women with excellent facilities. Located in a peaceful neighborhood with 24/7 security and close to major companies and shopping areas.",
    location: "HSR Layout, Bangalore",
    address: "456 Sector 2, HSR Layout, Bangalore - 560102",
    priceRange: "10,000 - 18,000",
    roomTypes: [
      {
        type: "Single Room",
        price: 18000,
        availability: 1,
        description: "Spacious room with private bathroom and balcony"
      },
      {
        type: "Double Sharing",
        price: 13000,
        availability: 4,
        description: "Well-furnished room with attached bathroom"
      },
      {
        type: "Triple Sharing",
        price: 10000,
        availability: 2,
        description: "Budget-friendly option with basic amenities"
      }
    ],
    amenities: [
      "WiFi", "AC", "Geyser", "Power Backup", "TV", "Refrigerator", 
      "Washing Machine", "Security", "CCTV", "Food", "Gym", "Housekeeping"
    ],
    images: [
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
      "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9"
    ],
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.5101428193213!2d77.63456231482148!3d12.9531417908196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1481c863ccef%3A0x5bb8ccd0a8a7ac89!2sHSR%20Layout%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1628162679128!5m2!1sen!2sin",
    contactNumber: "9876543211",
    contactEmail: "greenvalleypg@example.com",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

module.exports = samplePGs;
