import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  PhoneAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inscription avec email/mot de passe
  const signUp = async (email, password, name, phone) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      if (userCredential.user) {
        await db()
          .collection('users')
          .doc(userCredential.user.uid)
          .set({
            name,
            email,
            phone: phone || '',
            createdAt: serverTimestamp(),
          }, { merge: true });
        
        return userCredential.user;
      }
    } catch (error) {
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Problème de connexion réseau');
      }
      throw error;
    }
  };

  // Connexion avec email/mot de passe
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Connexion avec Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: userCredential.user.displayName,
          email: userCredential.user.email,
          createdAt: new Date().toISOString()
        });
      }
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Connexion avec Facebook
  const signInWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: userCredential.user.displayName,
          email: userCredential.user.email,
          createdAt: new Date().toISOString()
        });
      }
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signInWithFacebook,
      signOut,
      onAuthStateChanged
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 