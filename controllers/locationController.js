const factory = require('./handlerFactory')
const Location = require('./../models/Location')

exports.getAllLocations = factory.getAll(Location)

exports.createLocation = factory.createOne(Location)

exports.getLocation = factory.getOne(Location)

exports.updateLocation = factory.updateOne(Location)

exports.deleteLocation = factory.deleteOne(Location)
//  const locations = 
//  [
//     {
//       "name": "xi-mobility",
//       "type": "ללא מעמ",
//       "address": "קאמן 12, מתחם RED אילת",
//       "coordinates": {
//         "lat": 29.5581,
//         "lng": 34.9482
//       },
//       "workingHours": {
//         "sunday": { "open": "09:00", "close": "22:00" },
//         "monday": { "open": "09:00", "close": "22:00" },
//         "tuesday": { "open": "09:00", "close": "22:00" },
//         "wednesday": { "open": "09:00", "close": "22:00" },
//         "thursday": { "open": "09:00", "close": "22:00" },
//         "friday": { "open": "09:00", "close": "כניסת שבת -1 שעה" },
//         "saturday": { "open": "", "close": "" }
//       },
//       "contact": {
//         "email": "info@inokim.com",
//         "phone": "0529537085"
//       },
//       "link": "https://il.inokim.com/"
//     }
  
//   ]
  


  

  const locations = [
  {
    name: "סניף קרית מוצקין",
    type: "חנות אינוקים",
    address: "גושן 87 קרית מוצקין",
    coordinates: { lat: 32.2043914, lng: 35.4245552 }, 
    workingHours: {}, 
    contact: {
      phone: "0525188355",
    },
    link: "https://il.inokim.com/", // אם יש לינק לעמוד או גוגל מפות
  },

];

async function updateLocationTypes() {
  const updates = [
    "סניף קרית מוצקין",
    "מורביס אופניים",
    "הכל על גלגלים",
    "אסף מוטורס",
    "אלקטרו בייק",
  ];

  const workingHours = {
    sunday:    { open: "09:00", close: "19:00" },
    monday:    { open: "09:00", close: "19:00" },
    tuesday:   { open: "09:00", close: "19:00" },
    wednesday: { open: "09:00", close: "19:00" },
    thursday:  { open: "09:00", close: "19:00" },
    friday:    {}, // ניתן לעדכן לפי הצורך
    saturday:  {}
  };

  for (const name of updates) {
    const result = await Location.updateOne(
      { name },
      {
        $set: {
          type: "מפיץ",
          workingHours
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Updated type + workingHours for: ${name}`);
    } else if (result.matchedCount > 0) {
      console.log(`⚠️ No change needed for: ${name} (already set)`);
    } else {
      console.warn(`❌ Not found: ${name}`);
    }
  }
}

const newLocations = [

  {
    name: "סניף קרית מוצקין",
    type: "חנות אינוקים",
    address: "גושן 87 קרית מוצקין",
    coordinates: { lat: 32.2043914, lng: 35.4245552 }, 
    workingHours: {}, 
    contact: {
      phone: "0525188355",
    },
    link: "https://il.inokim.com/", 
   workingHours: {
      sunday: { open: "09:00", close: "19:00" },
      monday: { open: "09:00", close: "19:00" },
      tuesday: { open: "09:00", close: "19:00" },
      wednesday: { open: "09:00", close: "19:00" },
      thursday: { open: "09:00", close: "19:00" },
      friday: { open: "09:00", close: "14:00" },
      saturday: { open: "", close: "" }
    },
  },





  // {
  //   name: "אופני גדרה",
  //   type: "מפיץ",
  //   address: "הבילויים 36, גדרה",
  //   coordinates: { lat: 31.8656, lng: 34.7825 }, 
  //   workingHours: {
  //     sunday: { open: "09:00", close: "22:00" },
  //     monday: { open: "09:00", close: "22:00" },
  //     tuesday: { open: "09:00", close: "22:00" },
  //     wednesday: { open: "09:00", close: "22:00" },
  //     thursday: { open: "09:00", close: "22:00" },
  //     friday: { open: "09:00", close: "כניסת שבת -1 שעה" },
  //     saturday: { open: "", close: "" }
  //   },
  //   contact: {
  //     phone: "0543545144",
  //   },
  //   link: "https://il.inokim.com/",
  // },
  // {
  //   name: "מאסטר בייק אילת",
  //   type: "מפיץ",
  //   address: "האגס 24, אילת",
  //   coordinates: { lat: 29.5580, lng: 34.9482 }, // אילת משוער
  //   workingHours: {
  //     sunday: { open: "09:00", close: "22:00" },
  //     monday: { open: "09:00", close: "22:00" },
  //     tuesday: { open: "09:00", close: "22:00" },
  //     wednesday: { open: "09:00", close: "22:00" },
  //     thursday: { open: "09:00", close: "22:00" },
  //     friday: { open: "09:00", close: "כניסת שבת -1 שעה" },
  //     saturday: { open: "", close: "" }
  //   },
  //   contact: {
  //     phone: "08-6655146", 
  //   },
  //   link: "https://il.inokim.com/",
  // },
  // {
  //   name: "אורבן רייד בע״מ",
  //   type: "מפיץ",
  //   address: "בן שמן 4, תל אביב (פינת יהודה מוזס ונח 20)",
  //   coordinates: { lat: 32.0601, lng: 34.7722 }, // תל אביב, משוער לפי בן שמן 4:contentReference[oaicite:4]{index=4}
  //   workingHours: {
  //     sunday: { open: "09:00", close: "22:00" },
  //     monday: { open: "09:00", close: "22:00" },
  //     tuesday: { open: "09:00", close: "22:00" },
  //     wednesday: { open: "09:00", close: "22:00" },
  //     thursday: { open: "09:00", close: "22:00" },
  //     friday: { open: "09:00", close: "כניסת שבת -1 שעה" },
  //     saturday: { open: "", close: "" }
  //   },
  //    contact: {
  //     phone: "0536500174",
  //   },
  //   link: "https://il.inokim.com/",
  // },
  // {
  //   name: "מייק בייק",
  //   type: "מפיץ",
  //   address: "דרך יותם 54, אילת",
  //   coordinates: { lat: 29.5566, lng: 34.9530 }, // אילת משוער
  //   workingHours: {
  //     sunday: { open: "09:00", close: "22:00" },
  //     monday: { open: "09:00", close: "22:00" },
  //     tuesday: { open: "09:00", close: "22:00" },
  //     wednesday: { open: "09:00", close: "22:00" },
  //     thursday: { open: "09:00", close: "22:00" },
  //     friday: { open: "09:00", close: "כניסת שבת -1 שעה" },
  //     saturday: { open: "", close: "" }
  //   },
  //   contact: {
  //     phone: "0536500174",
  //   },
  //   link: "https://il.inokim.com/",
  // }
];



//  updateLocationTypes();

// Function to import locations
const importLocations = async () => {

    // const test = JSON.parse(locations)
    // console.log(locations)
  try {

    // Check for existing locations to prevent duplicates
    for (const location of newLocations) {
      const exists = await Location.findOne({ name: location.name, address: location.address });
      if (!exists) {
        await Location.create(location);
        console.log(`✅ Added: ${location.name}`);
      } else {
        console.log(`⚠️ Skipped (already exists): ${location.name}`);
      }
    }

    console.log("🎉 Import completed successfully");

  } catch (error) {
    console.error("❌ Error importing locations:", error);

  }
};

// Run the import function
    // importLocations();


    const updateLocationsType = async () => {
    
      // Replace with the exact names you want to update
      const targetNames = [
        "אייסמול אילת",
        "קניון מול הים אילת",
        "קניון שבעת הכוכבים אילת"
      ];
    
      try {
        const result = await Location.updateMany(
          { address: { $in: targetNames } },
          { $set: { type: "ללא מעמ" } }
        );
    
        console.log(`Updated ${result.modifiedCount} locations to 'ללא מעמ'`);
      } catch (err) {
        console.error("Error updating locations:", err.message);
      }
    };

    // updateLocationsType();