#ifdef RCT_NEW_ARCH_ENABLED
#import "NativeHTML5AdManager.h"

#import <React/RCTFabricComponentsPlugins.h>
#import <React/RCTConversions.h>
#import <React/RCTBridgeModule.h>

// Swift → ObjC header
#if __has_include("Adgeist-Swift.h")
#import "Adgeist-Swift.h"
#elif __has_include(<adgeist/adgeist-Swift.h>)
#import <Adgeist/Adgeist-Swift.h>
#else
@import adgeist;
#endif

#import "react/renderer/components/RNAdgeistSpec/ComponentDescriptors.h"
#import "react/renderer/components/RNAdgeistSpec/EventEmitters.h"
#import "react/renderer/components/RNAdgeistSpec/Props.h"
#import "react/renderer/components/RNAdgeistSpec/RCTComponentViewHelpers.h"

using namespace facebook::react;

@interface RCTNativeHTML5AdManager () <RCTHTML5AdNativeComponentViewProtocol, NativeHTML5AdDelegate>
@end

@implementation RCTNativeHTML5AdManager {
    NativeHTML5AdView *_swiftView;
}

- (instancetype)init
{
    if (self = [super init]) {
        _swiftView = [[NativeHTML5AdView alloc] initWithFrame:CGRectZero];
        _swiftView.delegate = self;
        [self addSubview:_swiftView];
    }
    return self;
}

- (void)dealloc
{
    _swiftView.delegate = nil;
    [_swiftView destroy];
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    [_swiftView destroy];
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    _swiftView.frame = self.bounds;
}

- (void)didMoveToSuperview
{
    [super didMoveToSuperview];
    if (self.superview) {
        [_swiftView triggerViewWillAppear];
    }
}

- (void)updateProps:(const facebook::react::Props::Shared &)props
           oldProps:(const facebook::react::Props::Shared &)oldProps
{
    const auto &newProps = *std::static_pointer_cast<const HTML5AdNativeComponentProps>(props);

    // Create a default old props if null (without parsing)
    HTML5AdNativeComponentProps defaultOldProps;
    const HTML5AdNativeComponentProps &oldPropsStruct = oldProps
        ? *std::static_pointer_cast<const HTML5AdNativeComponentProps>(oldProps)
        : defaultOldProps;
  
    if (oldPropsStruct.adUnitID != newProps.adUnitID) {
        _swiftView.adUnitID = newProps.adUnitID.empty()
            ? nil
            : [NSString stringWithUTF8String:newProps.adUnitID.c_str()];
    }

    if (oldPropsStruct.adIsResponsive != newProps.adIsResponsive) {
        _swiftView.adIsResponsive = newProps.adIsResponsive;
    }

    if (oldPropsStruct.adSize.width != newProps.adSize.width ||
        oldPropsStruct.adSize.height != newProps.adSize.height) {

        NSMutableDictionary *dict = [NSMutableDictionary dictionary];
        if (newProps.adSize.width != 0.0) {
            dict[@"width"] = @(newProps.adSize.width);
        }
        if (newProps.adSize.height != 0.0) {
            dict[@"height"] = @(newProps.adSize.height);
        }
        _swiftView.adSize = dict.count > 0 ? dict : nil;
        
        if (_swiftView.adUnitID != nil) {
            [_swiftView reloadAd];
        }
    }

    if (oldPropsStruct.reserveSpace != newProps.reserveSpace) {
        _swiftView.reserveSpace = newProps.reserveSpace;
    }

    [super updateProps:props oldProps:oldProps];
}

- (void)onAdEvent:(NativeHTML5AdView *)view
              code:(NSString *)code
              type:(NSString *)type
           message:(NSString *)message
            reason:(NSString *)reason
{
    if (_eventEmitter) {
        HTML5AdNativeComponentEventEmitter::OnAdEvent event{};
        event.code = code ? std::string([code UTF8String]) : "";
        event.type = type ? std::string([type UTF8String]) : "";
        event.message = message ? std::string([message UTF8String]) : "";
        event.data.reason = reason ? std::string([reason UTF8String]) : "";
        std::static_pointer_cast<const HTML5AdNativeComponentEventEmitter>(_eventEmitter)
            ->onAdEvent(event);
    }
}

- (void)onAdSizeChanged:(NativeHTML5AdView *)view width:(double)width height:(double)height
{
    if (_eventEmitter) {
        HTML5AdNativeComponentEventEmitter::OnAdSizeChanged event{};
        event.width = width;
        event.height = height;
        std::static_pointer_cast<const HTML5AdNativeComponentEventEmitter>(_eventEmitter)
            ->onAdSizeChanged(event);
    }
}

- (void)handleCommand:(NSString const *)commandName args:(NSArray const *)args
{
    RCTHTML5AdNativeComponentHandleCommand(self, commandName, args);
}

- (void)loadAd
{
    [_swiftView loadAd];
}

- (void)destroy
{
    [_swiftView destroy];
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<HTML5AdNativeComponentComponentDescriptor>();
}

@end

Class<RCTComponentViewProtocol> HTML5AdNativeComponentCls(void)
{
    return RCTNativeHTML5AdManager.class;
}

#else

#import "NativeHTML5AdManager.h"
#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import <React/RCTBridge.h>
#import <objc/runtime.h>

// Swift → ObjC header
#if __has_include("Adgeist-Swift.h")
#import "Adgeist-Swift.h"
#elif __has_include(<adgeist/adgeist-Swift.h>)
#import <Adgeist/Adgeist-Swift.h>
#else
@import adgeist;
#endif

@interface RCTNativeHTML5AdManager () <NativeHTML5AdDelegate>
@end

@implementation RCTNativeHTML5AdManager

RCT_EXPORT_MODULE(HTML5AdNativeComponent)

- (UIView *)view
{
    NativeHTML5AdView *swiftView = [[NativeHTML5AdView alloc] initWithFrame:CGRectZero];
    swiftView.delegate = self;
    return swiftView;
}

RCT_EXPORT_VIEW_PROPERTY(adUnitID, NSString)
RCT_EXPORT_VIEW_PROPERTY(adIsResponsive, BOOL)
RCT_EXPORT_VIEW_PROPERTY(adSize, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(reserveSpace, BOOL)

RCT_EXPORT_VIEW_PROPERTY(onAdEvent, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdSizeChanged, RCTDirectEventBlock)

RCT_EXPORT_METHOD(loadAd:(nonnull NSNumber *)reactTag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        NativeHTML5AdView *view = (NativeHTML5AdView *)viewRegistry[reactTag];
        if ([view isKindOfClass:[NativeHTML5AdView class]]) {
            [view loadAd];
        }
    }];
}

RCT_EXPORT_METHOD(destroy:(nonnull NSNumber *)reactTag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        NativeHTML5AdView *view = (NativeHTML5AdView *)viewRegistry[reactTag];
        if ([view isKindOfClass:[NativeHTML5AdView class]]) {
            [view destroy];
        }
    }];
}

- (NSArray<NSString *> *)customDirectEventTypes
{
    return @[@"onAdEvent", @"onAdSizeChanged"];
}

// NativeHTML5AdDelegate methods
// Note: In Old Architecture, events are handled directly by the NativeHTML5AdView via properties.
// The delegate methods are kept empty or for logging as the View now calls the block directly.
- (void)onAdEvent:(NativeHTML5AdView *)view
              code:(NSString *)code
              type:(NSString *)type
           message:(NSString *)message
            reason:(NSString *)reason
{
}

- (void)onAdSizeChanged:(NativeHTML5AdView *)view width:(double)width height:(double)height
{
}

@end

#endif
