import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
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

// Use the numeric report id (Date.now()) as the Firestore document ID so all
// screens can reference the same document without a separate id-tracking field.
export const submitReport = async (report, userId) => {
  try {
    await setDoc(doc(db, 'reports', String(report.id)), {
      ...report,
      submittedBy: userId,
      submittedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('submitReport error:', error.message);
    return { success: false, error: error.message };
  }
};

export const getReportsByStatus = async (status) => {
  try {
    const q = query(collection(db, 'reports'), where('status', '==', status));
    const snapshot = await getDocs(q);
    return { success: true, data: snapshot.docs.map((d) => d.data()) };
  } catch (error) {
    console.error('getReportsByStatus error:', error.message);
    return { success: false, data: [] };
  }
};

export const getReportsByStatuses = async (statuses) => {
  try {
    const q = query(collection(db, 'reports'), where('status', 'in', statuses));
    const snapshot = await getDocs(q);
    return { success: true, data: snapshot.docs.map((d) => d.data()) };
  } catch (error) {
    console.error('getReportsByStatuses error:', error.message);
    return { success: false, data: [] };
  }
};

export const getAllReports = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'reports'));
    return { success: true, data: snapshot.docs.map((d) => d.data()) };
  } catch (error) {
    console.error('getAllReports error:', error.message);
    return { success: false, data: [] };
  }
};

export const updateReportStatus = async (reportId, updates) => {
  try {
    await updateDoc(doc(db, 'reports', String(reportId)), updates);
    return { success: true };
  } catch (error) {
    console.error('updateReportStatus error:', error.message);
    return { success: false, error: error.message };
  }
};

export const uploadReportImage = async (localUri, reportId) => {
  try {
    // fetch() returns ArrayBuffer on React Native local URIs, which Firebase rejects.
    // XMLHttpRequest with responseType 'blob' produces a proper Blob.
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new Error('Failed to read image file'));
      xhr.responseType = 'blob';
      xhr.open('GET', localUri, true);
      xhr.send(null);
    });
    const storageRef = ref(storage, `reports/${reportId}.jpg`);
    const snapshot = await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(snapshot.ref);
    blob.close?.(); // release memory on Android
    return { success: true, url };
  } catch (error) {
    console.error('uploadReportImage error:', error.message);
    return { success: false, url: null };
  }
};

export const getUserReports = async (userId) => {
  try {
    const q = query(collection(db, 'reports'), where('submittedBy', '==', userId));
    const snapshot = await getDocs(q);
    return { success: true, data: snapshot.docs.map((d) => d.data()) };
  } catch (error) {
    console.error('getUserReports error:', error.message);
    return { success: false, data: [] };
  }
};

export const logout = () => signOut(auth);

// Uses a secondary app instance so the admin session is never interrupted.
export const createWorkerAccount = async (email, password, fullName) => {
  try {
    const secondaryApp =
      getApps().find((a) => a.name === 'workerCreator') ??
      initializeApp(firebaseConfig, 'workerCreator');
    const secondaryAuth = getAuth(secondaryApp);
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      fullName,
      role: 'worker',
      createdAt: new Date().toISOString(),
    });
    await signOut(secondaryAuth);
    return { success: true };
  } catch (error) {
    console.error('createWorkerAccount error:', error.message);
    return { success: false, error: error.message };
  }
};
