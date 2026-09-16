import Foundation
import AdgeistKit
import React

@objc public class AdgeistImpl: NSObject {

    private static let unsupportedMessage = "Not supported by AdgeistKit for iOS"

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
        rejecter("UNSUPPORTED", "fetchCreative is not supported on iOS. Render ads with HTML5AdView.", nil)
    }

    @objc public func setUserDetails(_ userDetailsDict: [String: Any]) {}

    @objc public func getConsentStatus(
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        resolver(false)
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
        resolver(Self.unsupportedMessage)
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
        resolver(Self.unsupportedMessage)
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
        resolver(Self.unsupportedMessage)
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
        resolver(Self.unsupportedMessage)
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
        resolver(Self.unsupportedMessage)
    }

    @objc public static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
