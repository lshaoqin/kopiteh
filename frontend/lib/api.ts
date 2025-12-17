// use this in the future instead of mock data

import { Stall, MenuItem } from "../../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Helper to handle the top-level response structure
async function fetchClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.payload?.message || "An error occurred");
  }

  // Unwrap Layer 1
  return json.payload.data; 
}

export const api = {
  getStallsByVenue: async (venueId: number): Promise<Stall[]> => {
    // 1. Fetch the data. Because of the backend structure, 'wrapper' is NOT the array yet.
    // It is the ServiceResult object: { success: true, payload: { data: [...] } }
    const wrapper = await fetchClient<any>(`/stalls/venue/${venueId}`);
    
    // 2. Unwrap Layer 2 to get the actual array
    // Check if 'wrapper.payload.data' exists, otherwise default to empty array
    const stallList = wrapper.payload?.data || [];

    if (!Array.isArray(stallList)) {
        console.error("Unexpected API response structure:", stallList);
        return [];
    }

    // 3. Map the array
    return stallList.map((item: any) => ({
      stall_id: String(item.stall_id),
      venue_id: String(item.venue_id),
      name: item.name,
      description: item.description,
      image_url: item.stall_image, // Mapping DB column to Frontend type
      is_open: item.is_open,
      waiting_time: item.waiting_time
    }));
  },

  getMenuByStall: async (stallId: number): Promise<MenuItem[]> => {
    // Assuming backend returns { payload: { data: [...] } }
    const wrapper = await fetchClient<any>(`/items/stalls/${stallId}`);
    return wrapper.payload?.data || [];
  },
  
  getStallById: async (stallId: number): Promise<any> => {
    const wrapper = await fetchClient<any>(`/stalls/${stallId}`);
    return wrapper.payload?.data || null;
  }
};