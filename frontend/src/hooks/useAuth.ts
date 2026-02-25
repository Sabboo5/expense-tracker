import { useAppSelector, useAppDispatch } from '@/store';
import {
  loginAsync,
  registerAsync,
  logoutAsync,
  fetchMeAsync,
  clearError,
} from '@/store/authSlice';
import { LoginCredentials, RegisterCredentials } from '@/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, accessToken, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const login = async (credentials: LoginCredentials) => {
    return dispatch(loginAsync(credentials));
  };

  const register = async (credentials: RegisterCredentials) => {
    return dispatch(registerAsync(credentials));
  };

  const logout = async () => {
    return dispatch(logoutAsync());
  };

  const fetchMe = async () => {
    return dispatch(fetchMeAsync());
  };

  const dismissError = () => {
    dispatch(clearError());
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchMe,
    dismissError,
  };
};
