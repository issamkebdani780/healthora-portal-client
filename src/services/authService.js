// Auth endpoints do not require authentication headers

const API_URL = import.meta.env.VITE_API_URL || 'https://aymen.linguaflo.me';

export const authService = {
  checkPhone: async (phone) => {
    try {
      const res = await fetch(`${API_URL}/patient-auth/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (!res.ok) throw new Error(data.message || 'Server error');
        return data;
      } catch (e) {
        throw new Error(`API returned invalid JSON: ${text.substring(0, 50)}...`);
      }
    } catch (error) {
      throw error;
    }
  },

  verifyOtp: async (phone, otp) => {
    try {
      const res = await fetch(`${API_URL}/patient-auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Server error');
      
      // Store token and patient profile
      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('patient', JSON.stringify(data.data));
      }
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  signup: async (patientData) => {
    try {
      // Map frontend camelCase to backend expected lower/snake_case
      const payload = {
        firstname: patientData.firstName,
        lastname: patientData.lastName,
        phone: patientData.phone,
        birthdate: patientData.birthDate,
        gender: patientData.gender,
      };

      const res = await fetch(`${API_URL}/patient-auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (!res.ok) throw new Error(data.message || 'Server error');
        
        // Store token and patient profile
        if (data.data?.token) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('patient', JSON.stringify(data.data));
        }
        return data.data;
      } catch (e) {
        throw new Error(`API returned invalid JSON: ${text.substring(0, 50)}...`);
      }
    } catch (error) {
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/patient-auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Server error');
      
      // Update local storage too to keep it synchronized
      if (data.data) {
        localStorage.setItem('patient', JSON.stringify(data.data));
      }
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('patient');
  }
};
