import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Check for existing session
    try {
      const currentUser = storage.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } finally {
      setAuthReady(true);
    }
  }, []);

  const login = async (identifier, password) => {
    // Find user by identifier (username, email, or phone)
    const foundUser = storage.getUserByIdentifier(identifier);
    if (foundUser) {
      const pw = foundUser.password ?? '';
      if (pw === password) {
        setUser(foundUser);
        storage.setCurrentUser(foundUser);
        return true;
      }
    }
    return false;
  };

  const sendVerificationCode = async (identifier, username, password) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString();

    const isEmail = identifier.includes('@');
    const email = isEmail ? identifier : undefined;
    const phone = !isEmail ? identifier : undefined;

    storage.savePendingRegistration({
      id: Date.now().toString(),
      name: username,
      email,
      phone,
      username,
      password,
      code,
      expiresAt,
    });

    console.info(`Verification code for ${identifier}: ${code}`);

    return { success: true, code };
  };

  const verifyCode = async (identifier, code) => {
    const pending = storage.getPendingRegistration(identifier);
    if (!pending) {
      return { success: false, message: 'No pending registration found for this identifier.' };
    }
    if (new Date(pending.expiresAt) < new Date()) {
      storage.removePendingRegistration(identifier);
      return { success: false, message: 'Verification code expired. Please request a new one.' };
    }
    if (pending.code !== code) {
      return { success: false, message: 'Invalid verification code.' };
    }

    // Create the user
    const existing = storage.getUserByIdentifier(identifier) || storage.getUserByUsername(pending.username);
    if (existing) {
      storage.removePendingRegistration(identifier);
      return { success: false, message: 'Account already exists.' };
    }

    const newUser = {
      id: Date.now().toString(),
      username: pending.username,
      email: pending.email,
      phone: pending.phone,
      role: 'customer',
      password: pending.password,
    };

    storage.saveUser(newUser);
    storage.removePendingRegistration(identifier);

    return { success: true };
  };

  const sendPasswordResetCode = async (identifier) => {
    const user = storage.getUserByIdentifier(identifier);
    if (!user) {
      return { success: false, message: 'No account found with that identifier.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString();

    const isEmail = identifier.includes('@');

    storage.savePasswordReset({
      email: isEmail ? identifier : undefined,
      phone: !isEmail ? identifier : undefined,
      code,
      expiresAt
    });

    console.info(`Password reset code for ${identifier}: ${code}`);

    return { success: true, code };
  };

  const resetPassword = async (identifier, code, newPassword) => {
    const reset = storage.getPasswordReset(identifier);
    if (!reset) {
      return { success: false, message: 'No password reset requested for this identifier.' };
    }
    if (new Date(reset.expiresAt) < new Date()) {
      storage.removePasswordReset(identifier);
      return { success: false, message: 'Reset code expired. Please request a new one.' };
    }
    if (reset.code !== code) {
      return { success: false, message: 'Invalid reset code.' };
    }

    const user = storage.getUserByIdentifier(identifier);
    if (!user) {
      storage.removePasswordReset(identifier);
      return { success: false, message: 'User not found.' };
    }

    storage.saveUser({ ...user, password: newPassword });
    storage.removePasswordReset(identifier);

    return { success: true };
  };

  const register = async (username, identifier, password) => {
    const existing = storage.getUserByIdentifier(identifier) || storage.getUserByUsername(username);
    if (existing) return { success: false, message: 'Username or identifier already exists.' };

    const isEmail = identifier.includes('@');

    const newUser = {
      id: Date.now().toString(),
      username,
      email: isEmail ? identifier : undefined,
      phone: !isEmail ? identifier : undefined,
      role: 'customer',
      password,
    };
    storage.saveUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    storage.setCurrentUser(null);
  };

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'admin' || user?.role === 'staff';

  const value = {
    user,
    login,
    register,
    sendVerificationCode,
    verifyCode,
    sendPasswordResetCode,
    resetPassword,
    logout,
    isAuthenticated,
    isAdmin,
    isStaff,
    authReady,
  };

  if (!authReady) {
    return <LoadingSkeleton />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
