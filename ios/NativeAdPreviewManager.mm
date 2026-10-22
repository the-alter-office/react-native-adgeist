#ifdef RCT_NEW_ARCH_ENABLED
#import "NativeAdPreviewManager.h"

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

static NSString *RCTAdgeistPreviewString(const std::string &value)
{
    return value.empty() ? nil : [NSString stringWithUTF8String:value.c_str()];
}

@interface RCTNativeAdPreviewManager () <RCTAdPreviewNativeComponentViewProtocol, NativeAdPreviewDelegate>
@end

@implementation RCTNativeAdPreviewManager {
    NativeAdPreviewView *_swiftView;
}

- (instancetype)init
{
    if (self = [super init]) {
        _swiftView = [[NativeAdPreviewView alloc] initWithFrame:CGRectZero];
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

- (void)updateProps:(const facebook::react::Props::Shared &)props
           oldProps:(const facebook::react::Props::Shared &)oldProps
{
    const auto &newProps = *std::static_pointer_cast<const AdPreviewNativeComponentProps>(props);

    // Create a default old props if null (without parsing)
    AdPreviewNativeComponentProps defaultOldProps;
    const AdPreviewNativeComponentProps &oldPropsStruct = oldProps
        ? *std::static_pointer_cast<const AdPreviewNativeComponentProps>(oldProps)
        : defaultOldProps;

    BOOL changed = NO;

    if (oldPropsStruct.type != newProps.type) {
        _swiftView.previewType = RCTNSStringFromString(toString(newProps.type));
        changed = YES;
    }

    if (oldPropsStruct.media != newProps.media) {
        _swiftView.previewMedia = RCTNSStringFromString(toString(newProps.media));
        changed = YES;
    }

    if (oldPropsStruct.creativeUrl != newProps.creativeUrl) {
        _swiftView.creativeUrl = RCTAdgeistPreviewString(newProps.creativeUrl);
        changed = YES;
    }

    if (oldPropsStruct.companionUrl != newProps.companionUrl) {
        _swiftView.companionUrl = RCTAdgeistPreviewString(newProps.companionUrl);
        changed = YES;
    }

    if (oldPropsStruct.title != newProps.title) {
        _swiftView.adTitle = RCTAdgeistPreviewString(newProps.title) ?: @"";
        changed = YES;
    }

    if (oldPropsStruct.description != newProps.description) {
        _swiftView.adDescription = RCTAdgeistPreviewString(newProps.description) ?: @"";
        changed = YES;
    }

    if (oldPropsStruct.ctaUrl != newProps.ctaUrl) {
        _swiftView.ctaUrl = RCTAdgeistPreviewString(newProps.ctaUrl) ?: @"https://adgeist.ai";
        changed = YES;
    }

    if (oldPropsStruct.deepLinkUrl != newProps.deepLinkUrl) {
        _swiftView.deepLinkUrl = RCTAdgeistPreviewString(newProps.deepLinkUrl);
        changed = YES;
    }

    if (oldPropsStruct.isResponsive != newProps.isResponsive) {
        _swiftView.isResponsive = newProps.isResponsive;
        changed = YES;
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
        changed = YES;
    }

    if (oldPropsStruct.reserveSpace != newProps.reserveSpace) {
        _swiftView.reserveSpace = newProps.reserveSpace;
        changed = YES;
    }

    if (changed) {
        [_swiftView reloadPreview];
    }

    [super updateProps:props oldProps:oldProps];
}

- (void)onPreviewEvent:(NativeAdPreviewView *)view
                  code:(NSString *)code
                  type:(NSString *)type
               message:(NSString *)message
                reason:(NSString *)reason
{
    if (_eventEmitter) {
        AdPreviewNativeComponentEventEmitter::OnAdEvent event{};
        event.code = code ? std::string([code UTF8String]) : "";
        event.type = type ? std::string([type UTF8String]) : "";
        event.message = message ? std::string([message UTF8String]) : "";
        event.data.reason = reason ? std::string([reason UTF8String]) : "";
        std::static_pointer_cast<const AdPreviewNativeComponentEventEmitter>(_eventEmitter)
            ->onAdEvent(event);
    }
}

- (void)onPreviewSizeChanged:(NativeAdPreviewView *)view width:(double)width height:(double)height
{
    if (_eventEmitter) {
        AdPreviewNativeComponentEventEmitter::OnAdSizeChanged event{};
        event.width = width;
        event.height = height;
        std::static_pointer_cast<const AdPreviewNativeComponentEventEmitter>(_eventEmitter)
            ->onAdSizeChanged(event);
    }
}

- (void)handleCommand:(NSString const *)commandName args:(NSArray const *)args
{
    RCTAdPreviewNativeComponentHandleCommand(self, commandName, args);
}

- (void)loadAd
{
    [_swiftView loadAd];
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<AdPreviewNativeComponentComponentDescriptor>();
}

@end

Class<RCTComponentViewProtocol> AdPreviewNativeComponentCls(void)
{
    return RCTNativeAdPreviewManager.class;
}

#else

#import "NativeAdPreviewManager.h"
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

@interface RCTNativeAdPreviewManager () <NativeAdPreviewDelegate>
@end

@implementation RCTNativeAdPreviewManager

RCT_EXPORT_MODULE(AdPreviewNativeComponent)

- (UIView *)view
{
    NativeAdPreviewView *swiftView = [[NativeAdPreviewView alloc] initWithFrame:CGRectZero];
    swiftView.delegate = self;
    return swiftView;
}

RCT_REMAP_VIEW_PROPERTY(type, previewType, NSString)
RCT_REMAP_VIEW_PROPERTY(media, previewMedia, NSString)
RCT_EXPORT_VIEW_PROPERTY(creativeUrl, NSString)
RCT_EXPORT_VIEW_PROPERTY(companionUrl, NSString)
RCT_REMAP_VIEW_PROPERTY(title, adTitle, NSString)
RCT_REMAP_VIEW_PROPERTY(description, adDescription, NSString)
RCT_EXPORT_VIEW_PROPERTY(ctaUrl, NSString)
RCT_EXPORT_VIEW_PROPERTY(deepLinkUrl, NSString)
RCT_EXPORT_VIEW_PROPERTY(isResponsive, BOOL)
RCT_EXPORT_VIEW_PROPERTY(adSize, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(reserveSpace, BOOL)

RCT_EXPORT_VIEW_PROPERTY(onAdEvent, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdSizeChanged, RCTDirectEventBlock)

RCT_EXPORT_METHOD(loadAd:(nonnull NSNumber *)reactTag)
{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        NativeAdPreviewView *view = (NativeAdPreviewView *)viewRegistry[reactTag];
        if ([view isKindOfClass:[NativeAdPreviewView class]]) {
            [view loadAd];
        }
    }];
}

- (NSArray<NSString *> *)customDirectEventTypes
{
    return @[@"onAdEvent", @"onAdSizeChanged"];
}

// NativeAdPreviewDelegate methods
// Note: In Old Architecture, events are handled directly by the NativeAdPreviewView via properties.
- (void)onPreviewEvent:(NativeAdPreviewView *)view
                  code:(NSString *)code
                  type:(NSString *)type
               message:(NSString *)message
                reason:(NSString *)reason
{
}

- (void)onPreviewSizeChanged:(NativeAdPreviewView *)view width:(double)width height:(double)height
{
}

@end

#endif
