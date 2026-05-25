const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["מפיץ רשמי", "חנות אינוקים", "ללא מעמ", "מפיץ"],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    workingHours: {
      sunday: { open: String, close: String },
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
    },
    contact: {
      email: {
        type: String,
        match: /.+\@.+\..+/,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    link: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Location", locationSchema);
