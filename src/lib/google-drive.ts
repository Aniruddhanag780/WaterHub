
"use client"

/**
 * Service to interact with Google Drive API
 */
export const GoogleDriveService = {
  /**
   * Uploads a JSON file to the user's Google Drive (appDataFolder or root with drive.file scope).
   * Since we use drive.file scope, we can only access files we create.
   */
  async uploadBackup(accessToken: string, filename: string, data: any) {
    const metadata = {
      name: filename,
      mimeType: 'application/json',
    };

    const fileContent = JSON.stringify(data);
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([fileContent], { type: 'application/json' }));

    try {
      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: form,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to upload to Google Drive');
      }

      return await response.json();
    } catch (error) {
      console.error('Google Drive Upload Error:', error);
      throw error;
    }
  }
};
