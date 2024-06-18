import { readable, writable } from "svelte/store";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
	
const firebaseConfig = {
	apiKey: "AIzaSyAVgrQZMkUPVcxCWZFSHhvRY3pnXmqxI4E",
	authDomain: "rn-ou-nfp.firebaseapp.com",
	projectId: "rn-ou-nfp",
	storageBucket: "rn-ou-nfp.appspot.com",
	messagingSenderId: "461327230325",
	appId: "1:461327230325:web:532bd279b6aea40e00df3c",
	measurementId: "G-D61HJKDN3S"
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