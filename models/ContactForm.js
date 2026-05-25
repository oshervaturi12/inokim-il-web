const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["contact", "test-ride", "business", "newsletter", "secondHand", "tradeId", "standingOrder", "purchase-group"],
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      // required: true,
      match: [/.+\@.+\..+/, "כתובת אימייל לא תקינה"],
    },
    phone: {
      type: String,
      // required: true,
      match: [/^\+?\d{9,15}$/, "מספר טלפון לא תקין"],
    },
    message: {
      type: String,
      trim: true,
    },
    vatNumber: {
      type: Number
    },


    // Fields specific to "test-ride"
    model: {
      type: String, // The selected scooter model
      trim: true,
      required: function () {
        return this.type === "test-ride";
      },
    },
    modelGet: {
      type: String
    },
    serialNUm: {
      type: String
    },
    preferredDate: {
      type: Date, // Preferred date for test ride
      // required: function () {
      //   return this.type === "test-ride";
      // },
    },
    location: {
      type: String, // Test ride location
      trim: true,
    },

    accountHolder: {
      type: String,
      trim: true
    },
    accountIdDoc: {
      type: String // store file path or filename
    },
    bankProof: {
      type: String // store file path or filename
    },
    idNumber: {
      type: String,
      trim: true
    },
    installments: {
      type: Number,
      min: 1,
      max: 36
    },
    paymentDate: {
      type: Date
    },
    address: {
      type: String,
      trim: true
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
