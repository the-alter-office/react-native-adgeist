export interface CPMADRESPONSE {
  success: boolean;
  message: string;
  data?: BidResponseData;
}

interface BidResponseData {
  id: string;
  seatBid: SeatBid[];
  bidId: string;
  cur: string;
}

interface SeatBid {
  bidId: string;
  bid: Bid[];
}

interface Bid {
  id: string;
  impId: string;
  price: number;
  ext: BidExtension;
}

interface BidExtension {
  creativeUrl: string;
  ctaUrl: string;
  creativeTitle: string;
  creativeDescription: string;
}
