export interface CPMADRESPONSE {
  id: string;
  bidId: string;
  cur: string;
  seatBid: SeatBid[];
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
  creativeBrandName?: string;
}
