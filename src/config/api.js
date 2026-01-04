/**
 * API Configuration
 * Centralized API endpoint management for easy integration with AWS Backend
 * 
 * TODO: Replace these mock URLs with your actual AWS API Gateway endpoints
 */

const API_BASE_URL = 'https://5cs5faz106.execute-api.us-east-2.amazonaws.com/prod';
const LOCAL_API_URL = 'http://localhost:5000'; // Local testing

export const API_ENDPOINTS = {
  // Campaign Management
  CAMPAIGNS: {
    LIST: `${API_BASE_URL}/campaigns`,
    CREATE: `${API_BASE_URL}/campaigns`,
    GET: (id) => `${API_BASE_URL}/campaigns/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/campaigns/${id}`,
    CONFIG: (id) => `${API_BASE_URL}/campaigns/${id}/config`,
    DELETE: (id) => `${API_BASE_URL}/campaigns/${id}`,
  },

  // Recipient/Contact Management
  RECIPIENTS: {
    IMPORT: `${API_BASE_URL}/campaigns/import`, // Lambda trigger for CSV processing
    LIST: (campaignId) => `${API_BASE_URL}/campaigns/${campaignId}/recipients`,
    ADD: (campaignId) => `${API_BASE_URL}/campaigns/${campaignId}/recipients`,
    UPDATE: (campaignId, recipientId) => `${API_BASE_URL}/campaigns/${campaignId}/recipients/${recipientId}`,
    DELETE: (campaignId, recipientId) => `${API_BASE_URL}/campaigns/${campaignId}/recipients/${recipientId}`,
  },

  // AI Content Generation
  AI: {
    GENERATE: `${API_BASE_URL}/ai/generate`, // AI content generation endpoint
    VARIATIONS: `${API_BASE_URL}/ai/variations`,
  },

  // Email Sending
  SEND: {
    CAMPAIGN: (campaignId) => `${API_BASE_URL}/campaigns/${campaignId}/send`, // Main send Lambda
    STATUS: (campaignId) => `${API_BASE_URL}/campaigns/${campaignId}/status`,
    RETRY: (campaignId) => `${API_BASE_URL}/campaigns/${campaignId}/retry-failed`,
  },

  // Compliance Checking
  COMPLIANCE: {
    CHECK: `${API_BASE_URL}/compliance/check`, // AWS Lambda compliance API
  },

  // Image Upload & Compliance Check
  IMAGES: {
    CHECK_AND_UPLOAD: `${API_BASE_URL}/images`,  // AWS Lambda with Claude Vision compliance
  },

  // Enterprise Contact Management
  CONTACTS: {
    LIST: `${API_BASE_URL}/contacts`,           // GET: List all contacts (supports ?tag=Tag)
    ADD: `${API_BASE_URL}/contacts`,            // POST: Create/Update contact
    DELETE: `${API_BASE_URL}/contacts/delete`,  // POST: Delete contact
    TAGS: `${API_BASE_URL}/contacts/tags`,      // GET: List tags, POST: Create tag
    IMPORT: `${API_BASE_URL}/contacts/import`,  // POST: Bulk import (Future Phase)
    VALIDATE: `${API_BASE_URL}/contacts/validate`, // POST: Batch check
    BATCH: `${API_BASE_URL}/contacts/batch`,       // POST: Batch save
  },
};

/**
 * HTTP Client wrapper for future API calls
 * This will make it easy to add authentication headers, error handling, etc.
 */
export const apiClient = {
  get: async (url) => {
    // TODO: Add authentication token from your auth system
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return response.json();
  },

  post: async (url, data) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  put: async (url, data) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (url) => {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return response.json();
  },
};
