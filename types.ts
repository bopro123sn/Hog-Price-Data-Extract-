
export interface HogPriceData {
  id: number;
  date: string;
  province: string;
  price: number;
}

export interface ExtractedDataResponse {
  extractedData: Omit<HogPriceData, 'id'>[];
  priceMovementSummary: string;
}

export interface GoogleCreds {
  clientId: string;
}
