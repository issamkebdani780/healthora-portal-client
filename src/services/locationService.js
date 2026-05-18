const API_URL = import.meta.env.VITE_API_URL || 'https://aymen.linguaflo.me';

export const locationService = {
  getWilayas: async () => {
    try {
      const res = await fetch(`${API_URL}/location/wilayas`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Error fetching wilayas');
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  getCommunes: async (wilayaId) => {
    if (!wilayaId) return [];
    try {
      const res = await fetch(`${API_URL}/location/communes/${wilayaId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Error fetching communes');
      return data.data;
    } catch (error) {
      throw error;
    }
  }
};
