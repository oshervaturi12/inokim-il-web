class APIFeatures {
    constructor(query, queryString, searchFields = []) {
        this.query = query;
        this.queryString = queryString;
        this.searchFields = Array.isArray(searchFields) ? searchFields : []; // Ensure it's always an array
  
  
      }
    
      // filter() {
      //   const queryObj = { ...this.queryString };
      //   const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
      //   excludedFields.forEach(el => delete queryObj[el]);
    
      //   // 1B) Advanced filtering
      //   let queryStr = JSON.stringify(queryObj);
      //   queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
      //   this.query = this.query.find(JSON.parse(queryStr));
        
    
      //   return this;
      // }
    
      filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach(el => delete queryObj[el]);
      
        // Ensure numeric values (e.g., status) are properly cast to Number
        const numericFields = ['status', 'priority', 'dudiPricing']; // Add more fields if needed
      
        for (const key in queryObj) {
          let value = queryObj[key];
      
          // Convert comma-separated values into an array for MongoDB $in
          if (typeof value === 'string' && value.includes(',')) {
            queryObj[key] = { $in: value.split(',').map(v => isNaN(v) ? v : Number(v)) }; // Convert only numbers
          } else if (numericFields.includes(key) && !isNaN(value)) {
            queryObj[key] = Number(value); // Convert to number if it's expected
          }
        }
      
        // Convert operators (gte, gt, lte, lt) to MongoDB format
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
      
        this.query = this.query.find(JSON.parse(queryStr));
      
        return this;
      }
      
  
      sort() {
        if (this.queryString.sort) {
          const sortBy = this.queryString.sort.split(',').join(' ');
          this.query = this.query.sort(sortBy);
        } else {
          this.query = this.query.sort('-createdAt');
        }
    
        return this;
      }
    
      limitFields() {
        if (this.queryString.fields) {
          const fields = this.queryString.fields.split(',').join(' ');
          this.query = this.query.select(fields);
        } else {
          this.query = this.query.select('-__v');
        }
    
        return this;
      }
    
      paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
    
        this.query = this.query.skip(skip).limit(limit);
    
        return this;
      }
  
      search() {
        // Ensure there is a search term and that searchFields is a valid array
        if (this.queryString.search && Array.isArray(this.searchFields) && this.searchFields.length > 0) {
          const searchTerm = this.queryString.search;
          const searchQueries = this.searchFields
            .filter(field => field) // Ensure fields are valid
            .map(field => ({
              [field]: { $regex: searchTerm, $options: 'i' } // Case-insensitive partial match
            }));
    
          // Apply search if there are valid search queries
          if (searchQueries.length > 0) {
            this.query = this.query.find({ $or: searchQueries });
          }
        }
    
        return this;
      }
    }
    
    module.exports = APIFeatures;
    