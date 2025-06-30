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
RCT_EXPORT_METHOD(fetchCreative:(NSString *)apiKey
                  origin:(NSString *)origin
                  adSpaceId:(NSString *)adSpaceId
                  publisherId:(NSString *)publisherId
                  isTestEnvironment:(BOOL)isTestEnvironment
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    [adgeist fetchCreativeWithApiKey:apiKey
                               origin:origin
                           adSpaceId:adSpaceId
                          publisherId:publisherId
                  isTestEnvironment:isTestEnvironment
                             resolver:resolve
                             rejecter:reject];
}

RCT_EXPORT_METHOD(sendCreativeAnalytic:(NSString *)campaignId
                  adSpaceId:(NSString *)adSpaceId
                  publisherId:(NSString *)publisherId
                  eventType:(NSString *)eventType
                  origin:(NSString *)origin
                  apiKey:(NSString *)apiKey
                  bidId:(NSString *)bidId
                  isTestEnvironment:(BOOL)isTestEnvironment
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    [adgeist sendCreativeAnalyticWithCampaignId:campaignId
                                      adSpaceId:adSpaceId
                                    publisherId:publisherId
                                      eventType:eventType
                                       origin:origin
                                       apiKey:apiKey
                                       bidId:bidId
                                       isTestEnvironment:isTestEnvironment
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