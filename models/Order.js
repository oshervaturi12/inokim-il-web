const mongoose = require('mongoose');


const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'paymentLink',
  },
  amount: {
    type: Number,
    default: 0,
  },
  cardDetails: {
    approval_num: String,
    voucher_num: String,
    four_digits: String,
    expiry_month: String,
    expiry_year: String,
    issuer_name: String,
    number_of_payments: Number,
    first_payment_amount: Number,
    rest_payments_amount: Number,
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  message: String,
});


const orderItemSchema = new mongoose.Schema({
  prdName: String,
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  color: {
    name: String,
    hex: String
  },
  sku: String,
  quantity: {
    type: Number,
    default: 1
  },
  img: {
    type: String
  },
  price: Number,
  serialNumber:{
    type: String
  },
  compareAtPrice: Number,
  availability: {
    type: String
  },
});

const orderSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  items: [orderItemSchema], // Order items copied from cart
  totalPrice: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null
  },
  shippingMethod: {
    type: String,
    enum: ['self_pickup', 'home_delivery'],
    required: true
  },
  isLeadSent: {
    type: Boolean,  
    default: false
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  shippingAddress: {
    city: String,
    address: String,
    addressNum: String,
    homeNum: String,
    homeFloor: String,
    homeEntrance: String,
    homeEntranceCode: String,
    note: String,

    hotelName: {
      type: String,
      default: ""
    },
    arrivalDate: {
      type: Date,
      default: null
    }
    
  },
  contactInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },
  paymentType: {
    type: String,
    enum: ['direct','paymentPhone'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  fulfilledFrom: {
    type: String,
    default: ""
  },
  transactionId: {
    type: String, // Store transaction ID from PayPlus
    default: null
  },
  paymentGatewayPageId: {
    type: String,
    // required: false,
  },
  paymentLink: {
    type: String
  },
  transactions: [transactionSchema],
  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  notes: String,
  newsletter: {
    type: Boolean,
    default: false
  },
  paymentGatewayTransactionId: {
    type: String
  },
  lastStatusModifiedDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
