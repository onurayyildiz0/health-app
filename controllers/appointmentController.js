const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// Randevu oluşturma
const createAppointment = async (req, res) => {
  try {
    const { doctor, patient, date, start, end, notes } = req.body;

    // Aynı doktor için çakışan randevuları kontrol et
    const overlappingAppointment = await Appointment.findOne({
      doctor,
      date,
      $or: [{ start: { $lt: end }, end: { $gt: start } }],
    });

    if (overlappingAppointment) {
      return res.status(400).json({
        message:
          "Bu saatlerde doktorun başka bir randevusu var. Lütfen başka bir saat seçin.",
      });
    }

    const appointment = new Appointment({
      doctor,
      patient,
      date,
      start,
      end,
      notes,
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Randevu oluşturulurken bir hata oluştu.", error });
  }
};

module.exports = {
  createAppointment,
};
