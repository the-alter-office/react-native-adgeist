#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface RCTNativeHTML5AdManager : RCTViewComponentView
@end

NS_ASSUME_NONNULL_END
#else
#import <React/RCTViewManager.h>

NS_ASSUME_NONNULL_BEGIN

@interface RCTNativeHTML5AdManager : RCTViewManager
@end

NS_ASSUME_NONNULL_END
#endif