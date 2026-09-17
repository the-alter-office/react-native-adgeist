export interface FIXEDADRESPONSE {
  expiresAt?: string;
  metaData: string;
  id: string;
  generatedAt?: string;
  campaignId?: string;
  advertiser?: Advertiser;
  type?: string;
  adSpaceType: AdSpaceType;
  loadType?: string;
  campaignValidity?: CampaignValidity;
  creativesV1: CreativeV1[];
  displayOptions?: DisplayOptions;
  frontendCacheDurationSeconds?: number;
}

type AdSpaceType = 'banner' | 'display' | 'companion';

interface Advertiser {
  id?: string;
  name?: string;
  logoUrl?: string;
}

interface CampaignValidity {
  startTime?: string;
  endTime?: string;
}

interface CreativeV1 {
  title?: string;
  description?: string;
  ctaUrl?: string;
  primary?: MediaItem;
  companions?: MediaItem[];
}

interface MediaItem {
  type?: string;
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
  thumbnailUrl?: string;
}

interface DisplayOptions {
  primaryFormats?: string[];
  companionFormats?: string[];
  dimensions?: Dimensions;
  isResponsive?: boolean;
  responsiveType?: string;
  styleOptions?: StyleOptions;
}

interface Dimensions {
  height?: number;
  width?: number;
}

interface StyleOptions {
  fontColor?: string;
  fontFamily?: string;
}
