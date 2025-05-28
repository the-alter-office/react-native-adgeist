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


// Exported methods for JS
RCT_EXPORT_METHOD(fetchCreative:(NSString *)adSpaceId
                  publisherId:(NSString *)publisherId
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject)
{
    [adgeist fetchCreativeWithAdSpaceId:adSpaceId publisherId:publisherId resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(sendCreativeAnalytic:(NSString *)campaignId
                   adSpaceId:(NSString *)adSpaceId
                 publisherId:(NSString *)publisherId
                   eventType:(NSString *)eventType
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject)
{
    [adgeist sendCreativeAnalyticWithCampaignId:campaignId
                                      adSpaceId:adSpaceId
                                    publisherId:publisherId
                                      eventType:eventType
                                       resolver:resolve
                                       rejecter:reject];
}

// TurboModule support for the new architecture
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAdgeistSpecJSI>(params);
}
#endif

@end