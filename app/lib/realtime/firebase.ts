import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, push, onValue, off, query, limitToLast } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

// Notify real-time listeners for a specific user wallet
export async function notifyPaymentEvent(walletAddress: string, data: any) {
  if (!firebaseConfig.databaseURL) return; // Prevent crashes if undefined in dev
  const notificationsRef = ref(database, `payments/${walletAddress}`);
  await push(notificationsRef, {
    ...data,
    timestamp: Date.now(),
  });
}

// Subscribe to real-time events for a wallet
export function subscribeToPayments(walletAddress: string, callback: (data: any) => void) {
  if (!firebaseConfig.databaseURL) return () => {};
  const notificationsRef = query(ref(database, `payments/${walletAddress}`), limitToLast(1));
  
  onValue(notificationsRef, (snapshot) => {
    if (snapshot.exists()) {
      // The push creates a unique key, value is the object
      const val = snapshot.val();
      const latestKey = Object.keys(val)[0];
      callback(val[latestKey]);
    }
  });

  return () => {
    off(notificationsRef);
  };
}
