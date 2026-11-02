import { track } from '../../analytics/eventBus';
import type { IRemoteFlags } from '../../state/flags';
import type { Tier } from '../../state/entitlement';
import type { IVideoSource } from '../../types/content';
import type { IAdPlaybackHost, IAdsManager } from '../../types/ads';
import { ImaAdManager } from './ImaAdManager';
import { NoopAdsManager } from './NoopAdsManager';
import { VmaxAdManager } from './VmaxAdManager';

interface ICreateAdsManagerArgs {
  contentId: string;
  source: IVideoSource;
  host: IAdPlaybackHost;
  flags: IRemoteFlags;
  tier: Tier;
  isAdFundedUnlock: boolean;
}

export function createAdsManager({ contentId, source, host, flags, tier, isAdFundedUnlock }: ICreateAdsManagerArgs): IAdsManager {
  if (tier === 'PASS') return new NoopAdsManager('Pass: ad-free');
  if (source.ssai?.enabled) {
    track('SSAILoaded', { assetKey: source.ssai.extraData.assetKey, sdkType: source.ssai.extraData.sdkType });
    return new NoopAdsManager('DAI (SSAI, simulated: ads stitched server-side)');
  }
  const csai = source.csai;
  if (!csai?.enabled) return new NoopAdsManager('No ads configured');
  if (csai.provider === 'IMA') return new ImaAdManager(contentId, csai.extraData, host);
  const vmaxAllowed = source.isLive ? flags.enableVmaxLive : flags.enableVmaxVod;
  if (!vmaxAllowed) return new NoopAdsManager('VMAX disabled by remote flag');
  return new VmaxAdManager({
    contentId,
    source,
    config: csai.extraData,
    host,
    minLiveBreakSec: flags.minLiveBreakSec,
    forcePreRoll: isAdFundedUnlock,
  });
}
