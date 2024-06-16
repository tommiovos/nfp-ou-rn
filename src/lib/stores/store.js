import { writable } from "svelte/store";

export const currentCard = writable(0);
export const isCurrentExplanation = writable(false);
export const isCurrentPriority = writable(false);
export const slideMagnitude = writable(0);