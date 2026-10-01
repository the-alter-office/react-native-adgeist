import Foundation
import AdgeistKit
import AppTrackingTransparency
import React

@objc public class AdgeistImpl: NSObject {

    @objc public func initializeSdk(
        customBidRequestBackendDomain: String?,
        customPackageOrBundleID: String?,
        customAdgeistAppID: String?,
        customVersioning: String?,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        AdgeistCore.shared.initialize()
        resolver("SDK initialized")
    }

    @objc public func destroySdk(
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        resolver("SDK destroyed")
    }

    @objc public func fetchCreative(
        adSpaceId: String,
        buyType: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        rejecter("NOT_SUPPORTED", "fetchCreative is not supported on iOS", nil)
    }

    @objc public func setUserDetails(_ userDetailsDict: [String: Any]) {}

    @objc public func getConsentStatus(resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        resolver(ATTrackingManager.trackingAuthorizationStatus == .authorized)
    }

    @objc public func updateConsentStatus(_ consent: Bool) {}

    @objc public func logEvent(eventDict: [String: Any]) {}

    @objc public func trackImpression(
        campaignId: String,
        adSpaceId: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        renderTime: Float,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        resolver("trackImpression is not supported on iOS")
    }

    @objc public func trackView(
        campaignId: String,
        adSpaceId: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        viewTime: Float,
        visibilityRatio: Float,
        scrollDepth: Float,
        timeToVisible: Float,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        resolver("trackView is not supported on iOS")
    }

    @objc public func trackTotalView(
        campaignId: String,
        adSpaceId: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        totalViewTime: Float,
        visibilityRatio: Float,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        resolver("trackTotalView is not supported on iOS")
    }

    @objc public func trackClick(
        campaignId: String,
        adSpaceId: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        resolver("trackClick is not supported on iOS")
    }

    @objc public func trackVideoPlayback(
        campaignId: String,
        adSpaceId: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        totalPlaybackTime: Float,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        resolver("trackVideoPlayback is not supported on iOS")
    }

    @objc public static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
