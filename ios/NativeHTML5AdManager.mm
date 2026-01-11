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

    if (oldPropsStruct.adType != newProps.adType) {
        _swiftView.adType = newProps.adType.empty()
            ? nil
            : [NSString stringWithUTF8String:newProps.adType.c_str()];
    }

    [super updateProps:props oldProps:oldProps];
}

- (void)onAdLoaded
{
    if (_eventEmitter) {
        std::static_pointer_cast<const HTML5AdNativeComponentEventEmitter>(_eventEmitter)
            ->onAdLoaded(HTML5AdNativeComponentEventEmitter::OnAdLoaded{});
    }
}

- (void)onAdFailedToLoad:(NSString *)error
{
    if (_eventEmitter) {
        HTML5AdNativeComponentEventEmitter::OnAdFailedToLoad event{};
        event.error = error ? std::string([error UTF8String]) : "";
        std::static_pointer_cast<const HTML5AdNativeComponentEventEmitter>(_eventEmitter)
            ->onAdFailedToLoad(event);
    }
}

- (void)onAdOpened
{
    if (_eventEmitter) {
        std::static_pointer_cast<const HTML5AdNativeComponentEventEmitter>(_eventEmitter)
            ->onAdOpened(HTML5AdNativeComponentEventEmitter::OnAdOpened{});
    }
}

- (void)onAdClosed
{
    if (_eventEmitter) {
        std::static_pointer_cast<const HTML5AdNativeComponentEventEmitter>(_eventEmitter)
            ->onAdClosed(HTML5AdNativeComponentEventEmitter::OnAdClosed{});
    }
}

- (void)onAdClicked
{
    if (_eventEmitter) {
        std::static_pointer_cast<const HTML5AdNativeComponentEventEmitter>(_eventEmitter)
            ->onAdClicked(HTML5AdNativeComponentEventEmitter::OnAdClicked{});
    }
}


- (void)handleCommand:(NSString const *)commandName args:(NSArray const *)args
{
    RCTHTML5AdNativeComponentHandleCommand(self, commandName, args);
}

- (void)loadAd:(BOOL)isTestMode
{
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];
    dict[@"isTestMode"] = @(isTestMode);
    [_swiftView loadAd:dict];
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
