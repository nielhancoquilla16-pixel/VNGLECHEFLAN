import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing session
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const login = async (identifier, password) => {
    // Find user by username or email
    let foundUser = storage.getUserByUsername(identifier);
    if (!foundUser) {
      foundUser = storage.getUserByEmail(identifier);
    }
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

  const sendVerificationCode = async (email, username, password) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString();

    storage.savePendingRegistration({
      id: Date.now().toString(),
      name: username,
      email,
      username,
      password,
      code,
      expiresAt,
    });

    // In a real app this would send an email.
    // For demo / local mode, we log the code so it can be copied.
    console.info(`Verification code for ${email}: ${code}`);

    return { success: true, code };
  };

  const verifyCode = async (email, code) => {
    const pending = storage.getPendingRegistration(email);
    if (!pending) {
      return { success: false, message: 'No pending registration found for this email.' };
    }
    if (new Date(pending.expiresAt) < new Date()) {
      storage.removePendingRegistration(email);
      return { success: false, message: 'Verification code expired. Please request a new one.' };
    }
    if (pending.code !== code) {
      return { success: false, message: 'Invalid verification code.' };
    }

    // Create the user
    const existing = storage.getUserByEmail(email) || storage.getUserByUsername(pending.username);
    if (existing) {
      storage.removePendingRegistration(email);
      return { success: false, message: 'Account already exists.' };
    }

    const newUser = {
      id: Date.now().toString(),
      username: pending.username,
      email: pending.email,
      role: 'customer',
      password: pending.password,
    };

    storage.saveUser(newUser);
    storage.removePendingRegistration(email);

    return { success: true };
  };

  const register = async (username, email, password) => {
    const existing = storage.getUserByEmail(email) || storage.getUserByUsername(username);
    if (existing) return { success: false, message: 'Username or email already exists.' };
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
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
    logout,
    isAuthenticated,
    isAdmin,
    isStaff,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
