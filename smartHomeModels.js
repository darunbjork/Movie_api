const mongoose = require('mongoose');

// Device schema
let deviceSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Description: { type: String, required: true },
  Status: { type: String, required: true },
  Type: { type: String, required: true },
  Location: { type: String, required: true },
  Manufacturer: { type: String },
  ModelNumber: { type: String },
  FirmwareVersion: { type: String },
  BatteryLevel: { type: String },
  Connectivity: { type: String },
  LastUpdated: { type: Date, default: Date.now },
  Schedule: {
    OnTime: { type: String },
    OffTime: { type: String }
  },
  EnergyConsumption: { type: String },
  Warnings: { type: [String] },
  ImageURL: { type: String }
});

// Models
let Device = mongoose.model('Device', deviceSchema);

module.exports.Device = Device;
