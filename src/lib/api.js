const API_BASE_URL = 'http://localhost:5000/api';

const apiCall = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const committeeAPI = {
    signup: async (userData) => {
        return apiCall('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },
    login: async (credentials) => {
        return apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },
    getCurrentUser: async () => {
        return apiCall('/auth/user', {
            method: 'GET',
        });
    },
    logout: async () => {
        return apiCall('/auth/logout', {
            method: 'POST',
        });
    },
};

export const adminAPI = {
    login: async (credentials) => {
        return apiCall('/admin/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },
    logout: async () => {
        return apiCall('/admin/logout', {
            method: 'POST',
        });
    },
    addAdmin: async (adminData) => {
        return apiCall('/admin/add-admin', {
            method: 'POST',
            body: JSON.stringify(adminData),
        });
    },
    // Committee management
    getPendingCommittees: async () => {
        return apiCall('/admin/committees/pending', {
            method: 'GET',
        });
    },
    approveCommittee: async (committeeId) => {
        return apiCall(`/admin/committees/${committeeId}/approve`, {
            method: 'PATCH',
        });
    },
    rejectCommittee: async (committeeId) => {
        return apiCall(`/admin/committees/${committeeId}/reject`, {
            method: 'DELETE',
        });
    },
    // Announcement management
    getPendingAnnouncements: async () => {
        return apiCall('/admin/announcements/pending', {
            method: 'GET',
        });
    },
    approveAnnouncement: async (announcementId) => {
        return apiCall(`/admin/announcements/${announcementId}/approve`, {
            method: 'PATCH',
        });
    },
    rejectAnnouncement: async (announcementId) => {
        return apiCall(`/admin/announcements/${announcementId}/reject`, {
            method: 'PATCH',
        });
    },
};

export const announcementAPI = {
    getAll: async () => {
        return apiCall('/announcements', {
            method: 'GET',
        });
    },
    getById: async (id) => {
        return apiCall(`/announcements/${id}`, {
            method: 'GET',
        });
    },
    getMy: async () => {
        return apiCall('/announcements/my/announcements', {
            method: 'GET',
        });
    },
    getByStatus: async (status) => {
        return apiCall(`/announcements/status/${status}`, {
            method: 'GET',
        });
    },
    create: async (announcementData) => {
        return apiCall('/announcements/create', {
            method: 'POST',
            body: JSON.stringify(announcementData),
        });
    },
    update: async (id, announcementData) => {
        return apiCall(`/announcements/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(announcementData),
        });
    },
    publish: async (id) => {
        return apiCall(`/announcements/publish/${id}`, {
            method: 'PATCH',
        });
    },
    delete: async (id) => {
        return apiCall(`/announcements/delete/${id}`, {
            method: 'DELETE',
        });
    },
    getPublished: async () => {
        return apiCall('/announcements/published', {
            method: 'GET',
        });
    },
    getByCategory: async (categoryId) => {
        return apiCall(`/announcements/category/${categoryId}`, {
            method: 'GET',
        });
    },
};

export const categoryAPI = {
    // Get all approved categories (Public)
    getAll: async () => {
        return apiCall('/categories', {
            method: 'GET',
        });
    },
    // Get category by ID
    getById: async (id) => {
        return apiCall(`/categories/${id}`, {
            method: 'GET',
        });
    },
    // Get my categories (Committee)
    getMy: async () => {
        return apiCall('/categories/my/categories', {
            method: 'GET',
        });
    },
    // Create new category (Committee)
    create: async (categoryData) => {
        return apiCall('/categories/create', {
            method: 'POST',
            body: JSON.stringify(categoryData),
        });
    },
    // Update category (Committee)
    update: async (id, categoryData) => {
        return apiCall(`/categories/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData),
        });
    },
    // Get pending categories (Admin)
    getPending: async () => {
        return apiCall('/categories/admin/pending', {
            method: 'GET',
        });
    },
    // Approve category (Admin)
    approve: async (id) => {
        return apiCall(`/categories/${id}/approve`, {
            method: 'PATCH',
        });
    },
    // Reject category (Admin)
    reject: async (id) => {
        return apiCall(`/categories/${id}/reject`, {
            method: 'DELETE',
        });
    },
    // Delete category (Admin)
    delete: async (id) => {
        return apiCall(`/categories/${id}`, {
            method: 'DELETE',
        });
    },
};

export default { committeeAPI, adminAPI, announcementAPI, categoryAPI };