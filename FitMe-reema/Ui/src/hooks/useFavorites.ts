/**
 * Favorites Persistence Hook
 * Manages favorite workouts in localStorage
 */

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "fitapp_favorites";

/**
 * Hook for managing favorite workouts
 * @returns Favorites state and toggle function
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  }, [favorites]);

  /**
   * Toggle favorite status for a workout
   */
  const toggleFavorite = useCallback((workoutId: string) => {
    setFavorites((prev) => {
      if (prev.includes(workoutId)) {
        return prev.filter((id) => id !== workoutId);
      } else {
        return [...prev, workoutId];
      }
    });
  }, []);

  /**
   * Check if a workout is favorited
   */
  const isFavorite = useCallback(
    (workoutId: string): boolean => {
      return favorites.includes(workoutId);
    },
    [favorites]
  );

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  };
}
