export interface FIXEDADRESPONSE {
  isTest?: boolean;
  expiresAt?: string;
  metaData: string;
  id: string;
  generatedAt?: string;
  signature?: string;
  campaignId?: string;
  advertiser?: Advertiser;
  type?: string;
  loadType?: string;
  campaignValidity?: CampaignValidity;
  creatives: Creative[];
  creativesV1: CreativeV1[];
  displayOptions?: DisplayOptions;
  frontendCacheDurationSeconds?: number;
  impressionRequirements?: ImpressionRequirements;
}

interface Advertiser {
  id?: string;
  name?: string;
  logoUrl?: string;
}

interface CampaignValidity {
  startTime?: string;
  endTime?: string;
}

interface Creative {
  contentModerationResult?: MongoIdWrapper;
  createdAt?: MongoDateWrapper;
  ctaUrl?: string;
  description?: string;
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  type?: string;
  updatedAt?: MongoDateWrapper;
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

interface MongoIdWrapper {
  $oid?: string;
}

interface MongoDateWrapper {
  $date?: number;
}

interface DisplayOptions {
  allowedFormats?: string[];
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

interface ImpressionRequirements {
  impressionType?: string[];
  minViewDurationSeconds?: number;
}
