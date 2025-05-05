#import "Adgeist.h"

#if __has_include("adgeist-Swift.h")
#import "adgeist-Swift.h"
#else
#import "adgeist/adgeist-Swift.h"
#endif

@implementation Adgeist {
    AdgeistImpl *adgeist;
}

- (id)init {
    if (self = [super init]) {
        adgeist = [AdgeistImpl new];
    }
    return self;
}

+ (NSString *)moduleName {
    return @"Adgeist";
}


- (void)fetchCreative:(NSString *)adSpaceId
          publisherId:(NSString *)publisherId
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  [adgeist fetchCreativeWithAdSpaceId:adSpaceId publisherId:publisherId resolver:resolve rejecter:reject];
}

- (void)sendCreativeAnalytic:(NSString *)campaignId
                   adSpaceId:(NSString *)adSpaceId
                 publisherId:(NSString *)publisherId
                   eventType:(NSString *)eventType
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  [adgeist sendCreativeAnalyticWithCampaignId:campaignId
                                  adSpaceId:adSpaceId
                                publisherId:publisherId
                                  eventType:eventType
                                   resolver:resolve
                                   rejecter:reject];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAdgeistSpecJSI>(params);
}

@end
