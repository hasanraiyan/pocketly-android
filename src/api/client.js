import * as SecureStore from 'expo-secure-store';

let _baseUrl = null;
let _token = null;

export async function loadCredentials() {
  _baseUrl = await SecureStore.getItemAsync('pocketly_base_url');
  _token = await SecureStore.getItemAsync('pocketly_token');
  return !!(_baseUrl && _token);
}

export async function saveCredentials(baseUrl, token) {
  await SecureStore.setItemAsync('pocketly_base_url', baseUrl);
  await SecureStore.setItemAsync('pocketly_token', token);
  _baseUrl = baseUrl;
  _token = token;
}

export async function clearCredentials() {
  await SecureStore.deleteItemAsync('pocketly_base_url');
  await SecureStore.deleteItemAsync('pocketly_token');
  _baseUrl = null;
  _token = null;
}

export function getBaseUrl() {
  return _baseUrl;
}

export async function api(path, options = {}) {
  const res = await fetch(`${_baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${_token}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export function streamChat(body, signal) {
  return fetch(`${_baseUrl}/api/money/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${_token}`,
    },
    body: JSON.stringify(body),
    signal,
  });
}