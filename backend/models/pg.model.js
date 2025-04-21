// In-memory PG database
const { v4: uuidv4 } = require('uuid');
const samplePGs = require('../data/sample-pgs');

// In-memory database
let pgs = [...samplePGs];

class PG {
  constructor(pgData) {
    this.id = pgData.id || uuidv4();
    this.title = pgData.title;
    this.description = pgData.description;
    this.location = pgData.location;
    this.address = pgData.address;
    this.priceRange = pgData.priceRange;
    this.roomTypes = pgData.roomTypes || [];
    this.amenities = pgData.amenities || [];
    this.images = pgData.images || [];
    this.mapEmbedUrl = pgData.mapEmbedUrl;
    this.contactNumber = pgData.contactNumber;
    this.contactEmail = pgData.contactEmail;
    this.createdAt = pgData.createdAt || new Date();
    this.updatedAt = new Date();
  }

  // Get all PGs with optional filtering
  static findAll(filter = {}) {
    let result = [...pgs];

    // Apply location filter
    if (filter.location) {
      result = result.filter(pg => 
        pg.location.toLowerCase().includes(filter.location.toLowerCase())
      );
    }

    // Apply price range filter
    if (filter.minPrice) {
      result = result.filter(pg => {
        // Extract minimum price from price range string
        const minPriceInPG = parseInt(pg.priceRange.split('-')[0].trim().replace(/,/g, ''));
        return minPriceInPG >= parseInt(filter.minPrice);
      });
    }

    if (filter.maxPrice) {
      result = result.filter(pg => {
        // Extract maximum price from price range string
        const parts = pg.priceRange.split('-');
        const maxPriceInPG = parts.length > 1 
          ? parseInt(parts[1].trim().replace(/,/g, ''))
          : parseInt(parts[0].trim().replace(/,/g, ''));
        return maxPriceInPG <= parseInt(filter.maxPrice);
      });
    }

    // Apply room type filter
    if (filter.roomType) {
      result = result.filter(pg => 
        pg.roomTypes.some(room => 
          room.type.toLowerCase().includes(filter.roomType.toLowerCase())
        )
      );
    }

    // Apply amenities filter
    if (filter.amenities && Array.isArray(filter.amenities)) {
      result = result.filter(pg => 
        filter.amenities.every(amenity => 
          pg.amenities.some(a => a.toLowerCase() === amenity.toLowerCase())
        )
      );
    }

    return result;
  }

  // Find PG by ID
  static findById(id) {
    return pgs.find(pg => pg.id === id);
  }

  // Create a new PG
  static create(pgData) {
    const newPG = new PG(pgData);
    pgs.push(newPG);
    return newPG;
  }

  // Update an existing PG
  static update(id, pgData) {
    const index = pgs.findIndex(pg => pg.id === id);
    if (index === -1) return null;

    // Preserve the id and createdAt date
    const updatedPG = new PG({
      ...pgData,
      id,
      createdAt: pgs[index].createdAt
    });

    pgs[index] = updatedPG;
    return updatedPG;
  }

  // Delete a PG
  static delete(id) {
    const index = pgs.findIndex(pg => pg.id === id);
    if (index === -1) return false;

    pgs.splice(index, 1);
    return true;
  }
}

module.exports = PG;
