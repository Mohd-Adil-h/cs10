import authService from '../services/authService.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * Controller handling user authentication requests (registration and logins).
 */
class AuthController {
  /**
   * Registers a new user.
   */
  register = catchAsync(async (req, res) => {
    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });
    res.status(201).json({
      success: true,
      token: result.token,
      user: result.user,
    });
  });

  /**
   * Authenticates user and returns JWT.
   */
  login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json({
      success: true,
      token: result.token,
      user: result.user,
    });
  });
}

export default new AuthController();
