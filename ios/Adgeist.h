#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "generated/RNAdgeistSpec/RNAdgeistSpec.h"

NS_ASSUME_NONNULL_BEGIN

@interface Adgeist : NSObject <NativeAdgeistSpec>

NS_ASSUME_NONNULL_END

#else
#import <React/RCTBridgeModule.h>

@interface Adgeist : NSObject <RCTBridgeModule>
#endif

@end
