import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBPqEpRX3c5G6dPGMJV06A7OMz1R1R9LPk',
  authDomain: 'pavement-watch-8c9de.firebaseapp.com',
  projectId: 'pavement-watch-8c9de',
  storageBucket: 'pavement-watch-8c9de.firebasestorage.app',
  messagingSenderId: '1063834639851',
  appId: '1:1063834639851:web:355b24f8bebda718798dae',
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);

export const signUp = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      fullName: userData.fullName,
      role: userData.role,
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('SignUp error:', error.message);
    return { success: false, error: error.message };
  }
}; 

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    let role = 'user';
    if (userDoc.exists()) {
      role = userDoc.data().role;
    }
    return { success: true, role };
  } catch (error) {
    console.error('SignIn error:', error.message);
    return { success: false, error: 'Invalid email or password' };
  }
};
