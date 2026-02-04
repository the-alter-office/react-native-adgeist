export interface FIXEDADRESPONSE {
  metaData: string;
  id: string;
  generatedAt: string;
  signature: string;
  campaignId: string;
  advertiser: Advertiser;
  type: 'FIXED' | string;
  loadType: 'QUICK' | string;
  displayOptions: DisplayOptions;
  campaignValidity: {
    startTime: string;
    endTime: string;
  };
  creatives: Creative[];
  frontendCacheDurationSeconds: number;
  impressionRequirements: {
    impressionType: ('VIEW' | 'CLICK')[];
    minViewDurationSeconds: number;
  };
}

interface Advertiser {
  id: string;
  name: string;
  logoUrl: string;
}

interface DisplayOptions {
  isResponsive: boolean;
  dimensions: {
    width: number;
    height: number;
  };
  styleOptions: {
    fontFamily: string;
    fontColor: string;
  };
  allowedFormats: string[];
}

interface Creative {
  ctaUrl: string;
  title: string;
  description: string;
  type: 'image' | string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl: string;
}
