const API_URL = import.meta.env.VITE_API_URL || 'https://aymen.linguaflo.me';

export const discoveryService = {
  searchDoctors: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.query) queryParams.append('query', params.query);
      if (params.specialityId) queryParams.append('specialityId', params.specialityId);
      if (params.wilayaId) queryParams.append('wilayaId', params.wilayaId);
      if (params.communeId) queryParams.append('communeId', params.communeId);
      if (params.availability) queryParams.append('availability', params.availability);
      if (params.limit) queryParams.append('limit', params.limit);

      const queryString = queryParams.toString();
      const url = `${API_URL}/discovery/search${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Error fetching doctors');
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  getSpecialities: async () => {
    try {
      const res = await fetch(`${API_URL}/discovery/specialities`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Error fetching specialities');
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  getDoctorDetails: async (doctorId) => {
    try {
      const res = await fetch(`${API_URL}/discovery/doctor-details/${doctorId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Error fetching doctor details');
      return data.data;
    } catch (error) {
      throw error;
    }
  }
};
