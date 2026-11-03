import Foundation
import AdgeistKit
import AppTrackingTransparency
import React
import UIKit

@objc public class AdgeistImpl: NSObject {

    private var pendingTrackingResolvers: [RCTPromiseResolveBlock] = []

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

    @objc public func requestTrackingAuthorization(
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            if UIApplication.shared.applicationState == .active {
                AdgeistImpl.presentTrackingAuthorizationRequest(resolvers: [resolver])
                return
            }
            self.pendingTrackingResolvers.append(resolver)
            if self.pendingTrackingResolvers.count == 1 {
                NotificationCenter.default.addObserver(
                    self,
                    selector: #selector(self.applicationDidBecomeActiveForTracking),
                    name: UIApplication.didBecomeActiveNotification,
                    object: nil
                )
            }
        }
    }

    @objc public func getTrackingAuthorizationStatus(
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        resolver(AdgeistImpl.trackingAuthorizationStatusString(ATTrackingManager.trackingAuthorizationStatus))
    }

    @objc private func applicationDidBecomeActiveForTracking() {
        NotificationCenter.default.removeObserver(
            self,
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
        let resolvers = pendingTrackingResolvers
        pendingTrackingResolvers.removeAll()
        AdgeistImpl.presentTrackingAuthorizationRequest(resolvers: resolvers)
    }

    private static func presentTrackingAuthorizationRequest(resolvers: [RCTPromiseResolveBlock]) {
        ATTrackingManager.requestTrackingAuthorization { status in
            let value = AdgeistImpl.trackingAuthorizationStatusString(status)
            resolvers.forEach { $0(value) }
        }
    }

    private static func trackingAuthorizationStatusString(_ status: ATTrackingManager.AuthorizationStatus) -> String {
        switch status {
        case .authorized:
            return "authorized"
        case .denied:
            return "denied"
        case .restricted:
            return "restricted"
        case .notDetermined:
            return "not-determined"
        @unknown default:
            return "unavailable"
        }
    }

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
