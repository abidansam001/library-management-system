const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  studentId: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);