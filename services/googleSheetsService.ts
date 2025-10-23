import type { HogPriceData, GoogleCreds } from '../types';

export const areGoogleKeysAvailable = (creds: GoogleCreds | null): boolean => {
    return !!(creds && creds.clientId);
}

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let gapi: any = null;
let gis: any = null;
let tokenClient: any = null;

export const initGoogleClient = (creds: GoogleCreds, callback: (isSignedIn: boolean) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!areGoogleKeysAvailable(creds)) {
            return reject(new Error("Google Client ID not provided."));
        }

        gapi = (window as any).gapi;
        gis = (window as any).google;
        if (!gapi || !gis) {
            return reject(new Error("Google API scripts not loaded"));
        }

        gapi.load('client', async () => {
            try {
                await gapi.client.init({
                    // API Key is not needed for OAuth 2.0 flows
                    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                });
                
                tokenClient = gis.accounts.oauth2.initTokenClient({
                    client_id: creds.clientId,
                    scope: SCOPES,
                    callback: (tokenResponse: any) => {
                        if (tokenResponse && tokenResponse.access_token) {
                            gapi.client.setToken(tokenResponse);
                            callback(true);
                        } else {
                            callback(false);
                        }
                    },
                    error_callback: (error: any) => {
                         console.error('GSI Error:', error);
                         callback(false);
                    }
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
};

export const handleAuthClick = () => {
  if (!gapi || !tokenClient) throw new Error("Google client not initialized.");
  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({prompt: 'consent'});
  } else {
    tokenClient.requestAccessToken({prompt: ''});
  }
};

export const handleSignOutClick = () => {
  if (!gapi) throw new Error("Google client not initialized.");
  const token = gapi.client.getToken();
  if (token !== null) {
    gis.accounts.oauth2.revoke(token.access_token, () => {
      gapi.client.setToken('');
    });
  }
};


export const createSpreadsheet = async (creds: GoogleCreds, data: HogPriceData[], title: string): Promise<string> => {
    if (!areGoogleKeysAvailable(creds)) {
        throw new Error("Cannot save to Sheets: Google credentials are not configured.");
    }
    if (!gapi) throw new Error("Google client not initialized.");

    try {
        const spreadsheet = await gapi.client.sheets.spreadsheets.create({
            properties: {
                title: title,
            }
        });

        const spreadsheetId = spreadsheet.result.spreadsheetId;
        if (!spreadsheetId) {
            throw new Error("Failed to get spreadsheet ID after creation.");
        }

        const headers = [['Date', 'Province', 'Price (K VND/kg)']];
        const rows = data.map(item => [item.date, item.province, Math.round(item.price / 1000).toString()]);
        const values = headers.concat(rows);

        const body = {
            values: values
        };

        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: 'A1',
            valueInputOption: 'USER_ENTERED',
            resource: body,
        });

        return spreadsheet.result.spreadsheetUrl;

    } catch (error) {
        console.error('Error creating spreadsheet:', error);
        const errorMessage = (error as any)?.result?.error?.message || "An unknown error occurred while saving to Google Sheets.";
        throw new Error(errorMessage);
    }
};
