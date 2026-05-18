const API_URL = import.meta.env.VITE_API_URL || 'https://aymen.linguaflo.me';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const appointmentService = {
  getMyAppointments: async () => {
    try {
      const res = await fetch(`${API_URL}/discovery/my-appointments`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Error fetching appointments');
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  getAvailableSlots: async (doctorId, date) => {
    try {
      const res = await fetch(`${API_URL}/discovery/available-slots?doctorId=${doctorId}&date=${date}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Error fetching slots');
      return data.data || [];
    } catch (error) {
      throw error;
    }
  },

  bookAppointment: async (doctorId, appointmentDate, startTime, notePatient = '') => {
    try {
      const res = await fetch(`${API_URL}/discovery/book`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          doctor_id: doctorId,
          appointment_date: appointmentDate,
          start_time: startTime,
          note_patient: notePatient
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Error booking appointment');
      return data.data;
    } catch (error) {
      throw error;
    }
  },
  
  cancelAppointment: async (appointmentId) => {
    try {
      const res = await fetch(`${API_URL}/discovery/cancel/${appointmentId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Error cancelling appointment');
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  getPatientPrescriptions: async () => {
    try {
      const res = await fetch(`${API_URL}/medical-records/prescriptions`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Error fetching prescriptions');
      return data.data || [];
    } catch (error) {
      throw error;
    }
  }
};
