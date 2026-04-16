const attendantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  staffId: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Attendant', attendantSchema);