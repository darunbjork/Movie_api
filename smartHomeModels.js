const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deviceSchema = new Schema({
  Name: { type: String, required: true },
  Description: String,
  Status: String,
  Brightness: { type: Number, default: 50 }, // Default to 50 if not specified
  Type: String,
  Location: String,
  BatteryLevel: String,
  Connectivity: String,
  EnergyConsumption: String,
  FirmwareVersion: String,
  LastUpdated: Date,
  Manufacturer: String,
  ModelNumber: String,
  Schedule: {
    OnTime: String,
    OffTime: String,
  },
  Warnings: [String],
  Alerts: [{
    Type: String,
    Threshold: String,
    Enabled: Boolean
  }],
  DeviceGroups: [String],
  DeviceStatusHistory: [{
    Status: String,
    Timestamp: Date
  }],
  EnergyUsageStatistics: {
    Daily: String,
    Weekly: String,
    Monthly: String
  },
  FirmwareUpdateLog: [{
    Version: String,
    Date: Date
  }],
  Geolocation: {
    Latitude: Number,
    Longitude: Number
  },
  ImagePath: String,
  IntegrationInformation: {
    HomeAssistant: {
      IntegrationID: String,
      Status: String
    },
    GoogleHome: {
      IntegrationID: String,
      Status: String
    }
  },
  MaintenanceSchedule: [{
    Task: String,
    DueDate: Date
  }],
  SensorData: {
    Temperature: String,
    Humidity: String
  },
  UserAccess: [{
    Username: String,
    AccessLevel: String
  }]
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = { Device };
