const FOLDER_NAME = 'FormGen Agenc-ia';
const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const FILE_MIME_TYPE = 'application/json';

// Helper for making API calls to Google Drive
const fetchDriveApi = async (url, options = {}, token, retries = 2) => {
  const headers = new Headers(options.headers || {});
  headers.append('Authorization', `Bearer ${token}`);
  
  let response;
  for (let i = 0; i <= retries; i++) {
    response = await fetch(url, { ...options, headers });
    
    if (response.ok || response.status === 204) {
      break;
    }
    
    if (i < retries && (response.status === 401 || response.status >= 500)) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      continue;
    }
    
    break;
  }

  if (response.status === 204) return null;
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Google Drive API Error: ${response.status} - ${error.error?.message || 'Unknown'}`);
  }
  return response.json();
};

export const getOrCreateFolder = async (token) => {
  // 1. Search for the folder
  const query = `mimeType='${FOLDER_MIME_TYPE}' and name='${FOLDER_NAME}' and trashed=false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id, name)`;
  
  const searchResult = await fetchDriveApi(searchUrl, {}, token);
  
  if (searchResult.files && searchResult.files.length > 0) {
    return searchResult.files[0].id;
  }
  
  // 2. If not found, create it
  const createUrl = 'https://www.googleapis.com/drive/v3/files';
  const metadata = {
    name: FOLDER_NAME,
    mimeType: FOLDER_MIME_TYPE,
  };
  
  const createResult = await fetchDriveApi(createUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata)
  }, token);
  
  return createResult.id;
};

export const listForms = async (token, folderId) => {
  const query = `'${folderId}' in parents and mimeType='${FILE_MIME_TYPE}' and trashed=false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id, name, createdTime)&orderBy=createdTime desc`;
  
  const result = await fetchDriveApi(searchUrl, {}, token);
  return result.files || [];
};

const makeFilePublic = async (fileId, token) => {
  const permissionUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`;
  await fetchDriveApi(permissionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'anyone',
      role: 'reader'
    })
  }, token);
};

export const saveFormToDrive = async (token, folderId, formName, formConfig, existingFileId = null) => {
  const metadata = {
    name: formName.endsWith('.json') ? formName : `${formName}.json`,
    mimeType: FILE_MIME_TYPE,
  };

  // If creating new file, specify parent folder
  if (!existingFileId) {
    metadata.parents = [folderId];
  }

  // Google Drive requires a multipart upload to send metadata AND content in one request
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(formConfig) +
    closeDelimiter;

  let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  let method = 'POST';

  if (existingFileId) {
    uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
    method = 'PATCH';
  }

  const result = await fetchDriveApi(uploadUrl, {
    method,
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  }, token);

  // Always ensure the file is publicly readable so the public form URL works
  try {
    await makeFilePublic(result.id, token);
  } catch (e) {
    // Permission may already exist, that's OK
    console.warn('makeFilePublic notice:', e.message);
  }

  return result.id;
};

export const getFormFromDrive = async (token, fileId) => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const headers = { 'Authorization': `Bearer ${token}` };
  
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Failed to download form');
  
  return response.json();
};

export const deleteFormFromDrive = async (token, fileId) => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  await fetchDriveApi(url, { method: 'DELETE' }, token);
};

