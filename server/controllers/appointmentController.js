const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

const createAppointment = async (req, res) => {
  try {
    const { doctor, date, start, end, notes } = req.body;
    const patient = req.user.id; // JWT ile gelen kullanıcı id

    // Doktorun varlığını kontrol et
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(400).json({
        message: "Geçersiz doktor ID. Lütfen geçerli bir doktor seçin.",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        message: "Başlangıç saati bitiş saatinden önce olmalı.",
      });
    }
    // Çakışan randevu kontrolü
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

const getAppointmentDetails = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctor", "name specialty")
      .populate("patient", "name email");
    if (!appointment) {
      return res.status(404).json({ message: "Randevu bulunamadı." });
    }
    res.json(appointment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Randevu detayları alınırken hata oluştu.", error });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Randevu bulunamadı." });
    }

    const userId = req.user.id;
    let authorizedId = userId; // Varsayılan yetkili ID, hasta için olan kullanıcı ID'sidir

    // Eğer kullanıcı doktorsa, authorizedId'yi doktorun kendi ID'si ile güncelliyoruz
    if (req.user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ user: userId });
      if (doctorProfile) {
        authorizedId = doctorProfile._id.toString();
      }
    }

    // Yetki kontrolü: Kullanıcı randevunun hastası veya doktoru mu?
    const isPatient = appointment.patient.toString() === userId;
    const isDoctor = appointment.doctor.toString() === authorizedId;

    if (!isPatient && !isDoctor) { // Kullanıcı bu iki rolden birine sahip değilse
      return res
        .status(403)
        .json({ message: "Bu randevuyu iptal etme yetkiniz yok." });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ message: "Randevu zaten iptal edilmiş." });
    }

    appointment.status = "cancelled";
    await appointment.save();
    res.json({ message: "Randevu başarıyla iptal edildi.", appointment });

  } catch (error) {
    res
      .status(500)
      .json({ message: "Randevu iptal edilirken hata oluştu.", error });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    // JWT'den gelen user id ile Doctor modelinden doctor id bul
    const userId = req.user.id;
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({ message: "Doktor kaydı bulunamadı." });
    }
    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate("patient", "name email")
      .sort({ date: 1, start: 1 });
    res.json(appointments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Doktor randevuları alınırken hata oluştu.", error });
  }
};

module.exports = {
  createAppointment,
  getAppointmentDetails,
  cancelAppointment,
  getDoctorAppointments,
};
