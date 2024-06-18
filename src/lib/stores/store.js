import { readable, writable } from "svelte/store";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { PUBLIC_FB_API_KEY, PUBLIC_FB_AUTH_DOMAIN, PUBLIC_FB_MEASUREMENT_ID, PUBLIC_FB_MESSAGING_SENDER_ID, PUBLIC_FB_PROJECT_ID, PUBLIC_FB_STORAGE_BUCKET, PUBLIC_FB_APP_ID } from "$env/static/public";

	
const firebaseConfig = {
	apiKey: PUBLIC_FB_API_KEY,
	authDomain: PUBLIC_FB_AUTH_DOMAIN,
	projectId: PUBLIC_FB_PROJECT_ID,
	storageBucket: PUBLIC_FB_STORAGE_BUCKET,
	messagingSenderId: PUBLIC_FB_MESSAGING_SENDER_ID,
	appId: PUBLIC_FB_APP_ID,
	measurementId: PUBLIC_FB_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db_ = getFirestore(app);

export const currentCard = writable(0);
export const isCurrentExplanation = writable(false);
export const isCurrentPriority = writable(false);
export const slideMagnitude = writable(0);
export const db = readable(db_, (set) => set(db_));
export const isLoading = writable(true);