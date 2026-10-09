// API connection module for VendorZone Backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Helper to get auth header with Bearer token
function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Response handler that extracts JSON and throws clean, readable errors
async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg =
      data.message || data.error || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

// -------------------------------------------------------------
// 1. Authentication & User
// -------------------------------------------------------------
export async function loginUser(data) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getCurrentUser() {
  const res = await fetch(`${API_URL}/api/users/me`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// -------------------------------------------------------------
// 2. Vendor Profile
// -------------------------------------------------------------
export async function getVendorProfile() {
  const res = await fetch(`${API_URL}/api/vendors/profile`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function createVendorProfile(data) {
  const res = await fetch(`${API_URL}/api/vendors/profile`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateVendorProfile(data) {
  const res = await fetch(`${API_URL}/api/vendors/profile`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// -------------------------------------------------------------
// 3. Vending Zones
// -------------------------------------------------------------
// Vendor view: Active zones
export async function getZones() {
  const res = await fetch(`${API_URL}/api/zones`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getZoneById(id) {
  const res = await fetch(`${API_URL}/api/zones/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// Officer view: All zones (active, inactive, maintenance)
export async function getOfficerZones() {
  const res = await fetch(`${API_URL}/api/zones/officer`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// Admin view: All zones
export async function getAdminZones() {
  const res = await fetch(`${API_URL}/api/zones/admin`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// Officer zone creation
export async function createZone(data) {
  const res = await fetch(`${API_URL}/api/zones`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Officer zone updates
export async function updateZone(id, data) {
  const res = await fetch(`${API_URL}/api/zones/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateZoneStatus(id, status) {
  const res = await fetch(`${API_URL}/api/zones/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

// -------------------------------------------------------------
// 4. Reservations & Booking
// -------------------------------------------------------------
export async function createReservation(data) {
  const res = await fetch(`${API_URL}/api/reservations`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getMyReservations() {
  const res = await fetch(`${API_URL}/api/reservations/my`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getReservationById(id) {
  const res = await fetch(`${API_URL}/api/reservations/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function cancelReservation(id) {
  const res = await fetch(`${API_URL}/api/reservations/${id}/cancel`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// Officer pending reservations
export async function getOfficerPendingReservations() {
  const res = await fetch(`${API_URL}/api/officers/reservations/pending`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// General reservations helper for officer view
export async function getReservations() {
  return getOfficerPendingReservations();
}

export async function approveReservation(id) {
  const res = await fetch(`${API_URL}/api/officers/reservations/${id}/approve`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function rejectReservation(id) {
  const res = await fetch(`${API_URL}/api/officers/reservations/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// Admin reservations
export async function getAdminReservations() {
  const res = await fetch(`${API_URL}/api/reservations/admin`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// -------------------------------------------------------------
// 5. Permits & QR Public Verification
// -------------------------------------------------------------
export async function getPermit(reservationId) {
  const res = await fetch(`${API_URL}/api/reservations/${reservationId}/permit`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// Public permit verification (zero-login required for civic enforcement & citizens)
export async function verifyPermit(permitId) {
  const res = await fetch(`${API_URL}/api/reservations/verify/${permitId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse(res);
}

// -------------------------------------------------------------
// 6. Complaints & Grievance Redressal
// -------------------------------------------------------------
export async function createComplaint(data) {
  const res = await fetch(`${API_URL}/api/complaints`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getMyComplaints() {
  const res = await fetch(`${API_URL}/api/complaints/my`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getOfficerComplaints() {
  const res = await fetch(`${API_URL}/api/complaints`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function updateComplaint(id, data) {
  const res = await fetch(`${API_URL}/api/complaints/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getAdminComplaints() {
  const res = await fetch(`${API_URL}/api/complaints/admin`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function updateAdminComplaint(id, data) {
  const res = await fetch(`${API_URL}/api/complaints/admin/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// -------------------------------------------------------------
// 7. Officer & Admin Management
// -------------------------------------------------------------
export async function getPendingVendors() {
  const res = await fetch(`${API_URL}/api/officers/vendors/pending`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// Alias for officer view
export async function getVendors() {
  return getPendingVendors();
}

export async function verifyVendor(id) {
  const res = await fetch(`${API_URL}/api/officers/vendors/${id}/verify`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function rejectVendor(id) {
  const res = await fetch(`${API_URL}/api/officers/vendors/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getAllVendors() {
  const res = await fetch(`${API_URL}/api/vendors`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getUsers() {
  const res = await fetch(`${API_URL}/api/users`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function createUser(data) {
  const res = await fetch(`${API_URL}/api/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateUserRole(userId, role) {
  const res = await fetch(`${API_URL}/api/users/${userId}/role`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  });
  return handleResponse(res);
}

export async function deleteUser(userId) {
  const res = await fetch(`${API_URL}/api/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getAdminStats() {
  const res = await fetch(`${API_URL}/api/users/stats`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}
