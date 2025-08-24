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

// Randevu detaylarını görüntüleme
const getAppointmentDetails = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate("doctor", "name speciality")
      .populate("patient", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Randevu bulunamadı." });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Randevu detayları alınırken bir hata oluştu.", error });
  }
};

// Randevu iptal etme
const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Randevu bulunamadı." });
    }

    // Sadece randevunun sahibi (hasta) veya doktor iptal edebilir
    if (
      appointment.patient.toString() !== req.user.id &&
      appointment.doctor.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Bu randevuyu iptal etme yetkiniz yok." });
    }

    await appointment.deleteOne();
    res.status(200).json({ message: "Randevu başarıyla iptal edildi." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Randevu iptal edilirken bir hata oluştu.", error });
  }
};

// Doktorun randevularını listeleme
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "name email")
      .sort({ date: 1, start: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Randevular alınırken bir hata oluştu.", error });
  }
};

module.exports = {
  createAppointment,
  getAppointmentDetails,
  cancelAppointment,
  getDoctorAppointments,
};
