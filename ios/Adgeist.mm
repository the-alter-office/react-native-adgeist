#import "Adgeist.h"

#if __has_include("adgeist-Swift.h")
#import "adgeist-Swift.h"
#else
#import "adgeist/adgeist-Swift.h"
#endif

@implementation Adgeist {
    AdgeistImpl *adgeist;
}

// Export the module for both old and new architectures
RCT_EXPORT_MODULE(Adgeist)

- (instancetype)init {
    if (self = [super init]) {
        adgeist = [AdgeistImpl new];
    }
    return self;
}

RCT_EXPORT_METHOD(initializeSdk:(NSString *)customBidRequestBackendDomain
                  customPackageOrBundleID:(NSString *)customPackageOrBundleID
                  customAdgeistAppID:(NSString *)customAdgeistAppID
                  customVersioning:(NSString *)customVersioning
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    [adgeist initializeSdkWithCustomBidRequestBackendDomain:customBidRequestBackendDomain
                                          customPackageOrBundleID:customPackageOrBundleID
                                               customAdgeistAppID:customAdgeistAppID
                                                 customVersioning:customVersioning
                                                         resolver:resolve
                                                         rejecter:reject];
}

RCT_EXPORT_METHOD(destroySdk:(RCTPromiseResolveBlock)resolve 
                  reject:(RCTPromiseRejectBlock)reject) {
    [adgeist destroySdkWithResolver:resolve 
                                  rejecter:reject];
}


RCT_EXPORT_METHOD(fetchCreative:(NSString *)adSpaceId
                  buyType:(NSString *)buyType
                  isTestEnvironment:(BOOL)isTestEnvironment
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    [adgeist fetchCreativeWithAdSpaceId:adSpaceId
                                       buyType:buyType
                             isTestEnvironment:isTestEnvironment
                                      resolver:resolve
                                      rejecter:reject];
}


RCT_EXPORT_METHOD(setUserDetails:(NSObject *)userDetails) {
    [adgeist setUserDetails:userDetails];
}

RCT_EXPORT_METHOD(getConsentStatus:(RCTPromiseResolveBlock)resolve 
                  reject:(RCTPromiseRejectBlock)reject) {
    [adgeist getConsentStatusWithResolver:resolve 
                                        rejecter:reject];
}

RCT_EXPORT_METHOD(updateConsentStatus:(BOOL)consent) {
    [adgeist updateConsentStatus:consent];
}

RCT_EXPORT_METHOD(trackDeeplinkUtm:(NSString *)url) {
    [adgeist trackDeeplinkUtmWithUrl:url];
}

RCT_EXPORT_METHOD(logEvent:(NSDictionary *)eventDict) {
    [adgeist logEventWithEventDict:eventDict];
}

RCT_EXPORT_METHOD(trackImpression:(NSString *)campaignId
                  adSpaceId:(NSString *)adSpaceId
                  bidId:(NSString *)bidId
                  bidMeta:(NSString *)bidMeta
                  buyType:(NSString *)buyType
                  isTestEnvironment:(BOOL)isTestEnvironment
                  renderTime:(double)renderTime
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    [adgeist trackImpressionWithCampaignId:campaignId
                                 adSpaceId:adSpaceId
                                     bidId:bidId
                                   bidMeta:bidMeta
                                   buyType:buyType
                         isTestEnvironment:isTestEnvironment
                                renderTime:(float)renderTime
                                  resolver:resolve
                                  rejecter:reject];
}

RCT_EXPORT_METHOD(trackView:(NSString *)campaignId
                  adSpaceId:(NSString *)adSpaceId
                  bidId:(NSString *)bidId
                  bidMeta:(NSString *)bidMeta
                  buyType:(NSString *)buyType
                  isTestEnvironment:(BOOL)isTestEnvironment
                  viewTime:(double)viewTime
                  visibilityRatio:(double)visibilityRatio
                  scrollDepth:(double)scrollDepth
                  timeToVisible:(double)timeToVisible
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    [adgeist trackViewWithCampaignId:campaignId
                           adSpaceId:adSpaceId
                               bidId:bidId
                             bidMeta:bidMeta
                             buyType:buyType
                   isTestEnvironment:isTestEnvironment
                            viewTime:(float)viewTime
                     visibilityRatio:(float)visibilityRatio
                         scrollDepth:(float)scrollDepth
                       timeToVisible:(float)timeToVisible
                            resolver:resolve
                            rejecter:reject];
}

RCT_EXPORT_METHOD(trackTotalView:(NSString *)campaignId
                  adSpaceId:(NSString *)adSpaceId
                  bidId:(NSString *)bidId
                  bidMeta:(NSString *)bidMeta
                  buyType:(NSString *)buyType
                  isTestEnvironment:(BOOL)isTestEnvironment
                  totalViewTime:(double)totalViewTime
                  visibilityRatio:(double)visibilityRatio
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    [adgeist trackTotalViewWithCampaignId:campaignId
                                adSpaceId:adSpaceId
                                    bidId:bidId
                                  bidMeta:bidMeta
                                  buyType:buyType
                        isTestEnvironment:isTestEnvironment
                            totalViewTime:(float)totalViewTime
                          visibilityRatio:(float)visibilityRatio
                                 resolver:resolve
                                 rejecter:reject];
}

RCT_EXPORT_METHOD(trackClick:(NSString *)campaignId
                  adSpaceId:(NSString *)adSpaceId
                  bidId:(NSString *)bidId
                  bidMeta:(NSString *)bidMeta
                  buyType:(NSString *)buyType
                  isTestEnvironment:(BOOL)isTestEnvironment
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    [adgeist trackClickWithCampaignId:campaignId
                            adSpaceId:adSpaceId
                                bidId:bidId
                              bidMeta:bidMeta
                              buyType:buyType
                    isTestEnvironment:isTestEnvironment
                             resolver:resolve
                             rejecter:reject];
}

RCT_EXPORT_METHOD(trackVideoPlayback:(NSString *)campaignId
                  adSpaceId:(NSString *)adSpaceId
                  bidId:(NSString *)bidId
                  bidMeta:(NSString *)bidMeta
                  buyType:(NSString *)buyType
                  isTestEnvironment:(BOOL)isTestEnvironment
                  totalPlaybackTime:(double)totalPlaybackTime
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    [adgeist trackVideoPlaybackWithCampaignId:campaignId
                                    adSpaceId:adSpaceId
                                        bidId:bidId
                                      bidMeta:bidMeta
                                      buyType:buyType
                            isTestEnvironment:isTestEnvironment
                            totalPlaybackTime:(float)totalPlaybackTime
                                     resolver:resolve
                                     rejecter:reject];
}

// RCT_EXPORT_METHOD(trackVideoQuartile:(NSString *)campaignId
//                   adSpaceId:(NSString *)adSpaceId
//                   bidId:(NSString *)bidId
//                   bidMeta:(NSString *)bidMeta
//                   buyType:(NSString *)buyType
//                   isTestEnvironment:(BOOL)isTestEnvironment
//                   quartile:(NSString *)quartile
//                   resolve:(RCTPromiseResolveBlock)resolve
//                   reject:(RCTPromiseRejectBlock)reject)
// {
//     [adgeist trackVideoQuartileWithCampaignId:campaignId
//                                     adSpaceId:adSpaceId
//                                         bidId:bidId
//                                       bidMeta:bidMeta
//                                       buyType:buyType
//                             isTestEnvironment:isTestEnvironment
//                                      quartile:quartile
//                                      resolver:resolve
//                                      rejecter:reject];
// }

// TurboModule support for the new architecture
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAdgeistSpecJSI>(params);
}
#endif

@end
