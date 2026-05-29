import apiClient from './apiClient';

/**
 * Frontend Service handling authentication API calls.
 */
class AuthService {
  /**
   * Log in user using email and password.
   */
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  }

  /**
   * Register a new user.
   */
  async register(name, email, password, role = 'asker') {
    const response = await apiClient.post('/auth/register', { name, email, password, role });
    return response.data;
  }
}

export default new AuthService();
