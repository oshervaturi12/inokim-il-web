const factory = require('./handlerFactory')
const ContactForm = require('./../models/ContactForm')
const eventEmitter = require('../events');

exports.getAllContactForms = factory.getAll(ContactForm)

// exports.createContactForm = factory.createOne(ContactForm)

exports.getContactForm = factory.getOne(ContactForm)

exports.updateContactForm = factory.updateOne(ContactForm)

exports.deleteContactForm = factory.deleteOne(ContactForm)

exports.createContactForm = async (req, res, next) => {
    try {
      const contactForm = await ContactForm.create(req.body);
  
      console.log("New contact form submitted:", contactForm);
  
      // Emit event to notify admin
      eventEmitter.emit('formSubmitted', {
        type: contactForm.type,
        fullName: contactForm.fullName,
        email: contactForm.email,
        phone: contactForm.phone,
        message: contactForm.message || "No message provided",
        model: contactForm.model || "N/A",
        serialNum: contactForm.serialNUm || "N/A",
        preferredDate: contactForm.preferredDate ? contactForm.preferredDate.toISOString().split('T')[0] : "N/A",
        location: contactForm.location || "N/A",
        createdAt: contactForm.createdAt
      });

    if (contactForm.type === 'purchase-group') {
      eventEmitter.emit('purchase-group', {
        type: 'purchase-group',
        fullName: contactForm.fullName,
        email: contactForm.email,
        phone: contactForm.phone,
        createdAt: contactForm.createdAt,
        updatedAt: contactForm.updatedAt,
      });
    }
  
      res.status(201).json({
        status: "success",
        data: contactForm
      });
    } catch (error) {
      console.error("❌ Error creating contact form:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };