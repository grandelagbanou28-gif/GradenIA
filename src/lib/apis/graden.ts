import { WEBUI_BASE_URL } from '$lib/constants';

export const scanFolder = async (token: string, folderPath: string) => {
	const res = await fetch(`${WEBUI_BASE_URL}/api/v1/graden/scan?folder_path=${encodeURIComponent(folderPath)}`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	if (!res.ok) {
		throw new Error('Erreur lors du scan du dossier');
	}

	return await res.json();
};

export const uploadFolder = async (token: string, folderPath: string) => {
	const res = await fetch(`${WEBUI_BASE_URL}/api/v1/graden/upload-folder?folder_path=${encodeURIComponent(folderPath)}`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	if (!res.ok) {
		throw new Error('Erreur lors de l\'upload du dossier');
	}

	return await res.json();
};

export const refreshModels = async (token: string) => {
	const res = await fetch(`${WEBUI_BASE_URL}/ollama/api/refresh`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	if (!res.ok) {
		throw new Error('Erreur lors du rafraîchissement des modèles');
	}

	return await res.json();
};
