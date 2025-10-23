/**
 * Fetches the raw HTML content from a given URL.
 * NOTE: This uses a third-party CORS proxy to bypass browser
 * security restrictions (CORS). This is suitable for demos, but for a production
 * application, you should build and host your own backend proxy service for
 * security, reliability, and to avoid rate-limiting from public proxies.
 * @param articleUrl The URL of the article to fetch.
 * @returns A promise that resolves to the HTML content as a string.
 */
export const fetchArticleHtml = async (articleUrl: string): Promise<string> => {
    // Using a public CORS proxy to bypass browser security issues.
    // Public proxies are inherently unreliable. Switching to another one to resolve fetch issues.
    const proxyUrl = `https://thingproxy.freeboard.io/fetch/${articleUrl}`;

    try {
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            // This is for HTTP errors from the proxy or target site (e.g., 403, 404, 500)
            throw new Error(`Failed to fetch article via proxy. Status: ${response.status} ${response.statusText}`);
        }

        return response.text();
    } catch (error) {
        // This catches network errors (like DNS issues, or the proxy being completely down),
        // which often manifest as a generic "Failed to fetch" TypeError.
        console.error("Article fetch error:", error);
        throw new Error("Could not fetch article. The public proxy service used to retrieve website content is likely unavailable or has been blocked. Please try again later.");
    }
};