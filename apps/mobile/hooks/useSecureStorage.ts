import { useCallback } from 'react';
import { secureStorage, STORAGE_KEYS } from '../lib/auth/secure-storage';

export function useSecureStorage() {
	const getSessionToken = useCallback(async (): Promise<string | null> => {
		return await secureStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
	}, []);

	const setSessionToken = useCallback(async (token: string): Promise<void> => {
		await secureStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
	}, []);

	const removeSessionToken = useCallback(async (): Promise<void> => {
		await secureStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
	}, []);

	const getItem = useCallback(async (key: string): Promise<string | null> => {
		return await secureStorage.getItem(key);
	}, []);

	const setItem = useCallback(async (key: string, value: string): Promise<void> => {
		await secureStorage.setItem(key, value);
	}, []);

	const removeItem = useCallback(async (key: string): Promise<void> => {
		await secureStorage.removeItem(key);
	}, []);

	return {
		getSessionToken,
		setSessionToken,
		removeSessionToken,
		getItem,
		setItem,
		removeItem,
	};
}
