import Foundation
import AdgeistKit
import React

@objc public class AdgeistImpl: NSObject {
    private var adgeistInstance: AdgeistCore?
    private var getAd: FetchCreative?
    private var postCreativeAnalytic: CreativeAnalytics?
    
    @objc public func initializeSdk(
        customBidRequestBackendDomain: String?,
        customPackageOrBundleID: String?,
        customAdgeistAppID: String?,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        do {
            adgeistInstance = AdgeistCore.initialize(customBidRequestBackendDomain: customBidRequestBackendDomain,
                                                     customPackageOrBundleID: customPackageOrBundleID,
                                                     customAdgeistAppID: customAdgeistAppID)
            getAd = adgeistInstance?.getCreative()
            postCreativeAnalytic = adgeistInstance?.postCreativeAnalytics()
            resolver("SDK initialized with domain: \(customBidRequestBackendDomain ?? "default")")
        } catch {
            rejecter("INIT_FAILED", "SDK initialization failed", error)
        }
    }

    @objc public func destroySdk(
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        AdgeistCore.destroy()
        resolver("SDK destroyed")
    }

    @objc public func fetchCreative(
        adSpaceId: String,
        buyType: String,
        isTestEnvironment: Bool,
        resolver: @escaping RCTPromiseResolveBlock, 
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        guard let getAd = getAd else {
            rejecter("SDK_NOT_INITIALIZED", "SDK not initialized. Call initializeSdk() first.", nil)
            return
        }

        getAd.fetchCreative(
            adSpaceId: adSpaceId,
            buyType: buyType,
            isTestEnvironment: isTestEnvironment
        ) { creativeData in
            if let creativeData = creativeData {
                var result: [String: Any] = [:]
                
                // Use Mirror to reflect the object's properties
                let mirror = Mirror(reflecting: creativeData)
                for child in mirror.children {
                    if let label = child.label {
                        result[label] = child.value
                    }
                }
                
                resolver(result)
            } else {
                rejecter("NO_AD", "Ad data not available", nil)
            }
        }
    }


    @objc public func setUserDetails(_ userDetailsDict: [String: Any]) {
        let filtered = userDetailsDict.compactMapValues { value -> Any? in
            (value is NSNull) ? nil : value
        }

       let userDetails = UserDetails(
            userId: userDetailsDict["userId"] as? String,
            userName: userDetailsDict["userName"] as? String,
            email: userDetailsDict["email"] as? String,
            phone: userDetailsDict["phone"] as? String
        )
        adgeistInstance?.setUserDetails(userDetails)
    }


    @objc public func getConsentStatus(resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        guard let adgeistInstance = adgeistInstance else {
            rejecter("SDK_NOT_INITIALIZED", "SDK not initialized. Call initializeSdk() first.", nil)
            return
        }
        let status = adgeistInstance.getConsentStatus()
        resolver(status)
    }

    @objc public func updateConsentStatus(_ consent: Bool) {
        adgeistInstance?.updateConsentStatus(consent)
    }


    @objc public func logEvent(eventDict: [String: Any]) {
        let filtered = eventDict.compactMapValues { value -> Any? in
            (value is NSNull) ? nil : value
        }

        guard let eventType = filtered["eventType"] as? String, !eventType.isEmpty else {
            print("Event must have a non-empty eventType")
            return
        }

        let eventProps = (filtered["eventProperties"] as? [String: Any])?.compactMapValues { value -> Any? in
            (value is NSNull) ? nil : value
        } ?? [:]

        let event = Event(eventType: eventType, eventProperties: eventProps)
        adgeistInstance?.logEvent(event)
    }

    @objc public func trackImpression(
        campaignId: String,
        adSpaceId: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Bool,
        renderTime: Double,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        guard let postCreativeAnalytic = postCreativeAnalytic else {
            rejecter("SDK_NOT_INITIALIZED", "SDK not initialized. Call initializeSdk() first.", nil)
            return
        }
        
        postCreativeAnalytic.trackImpression(
            campaignId: campaignId,
            adSpaceId: adSpaceId,
            bidId: bidId,
            bidMeta: bidMeta,
            buyType: buyType,
            isTestEnvironment: isTestEnvironment,
            renderTime: Float(renderTime)
        )
        resolver("Impression event sent")
    }

    @objc public func trackView(
        campaignId: String,
        adSpaceId: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Bool,
        viewTime: Double,
        visibilityRatio: Double,
        scrollDepth: Double,
        timeToVisible: Double,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        guard let postCreativeAnalytic = postCreativeAnalytic else {
            rejecter("SDK_NOT_INITIALIZED", "SDK not initialized. Call initializeSdk() first.", nil)
            return
        }
        
        postCreativeAnalytic.trackView(
            campaignId: campaignId,
            adSpaceId: adSpaceId,
            bidId: bidId,
            bidMeta: bidMeta,
            buyType: buyType,
            isTestEnvironment: isTestEnvironment,
            viewTime: Float(viewTime),
            visibilityRatio: Float(visibilityRatio),
            scrollDepth: Float(scrollDepth),
            timeToVisible: Float(timeToVisible)
        )
        resolver("View event sent")
    }

    @objc public func trackTotalView(
        campaignId: String,
        adSpaceId: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Bool,
        totalViewTime: Double,
        visibilityRatio: Double,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        guard let postCreativeAnalytic = postCreativeAnalytic else {
            rejecter("SDK_NOT_INITIALIZED", "SDK not initialized. Call initializeSdk() first.", nil)
            return
        }
        
        postCreativeAnalytic.trackTotalView(
            campaignId: campaignId,
            adSpaceId: adSpaceId,
            bidId: bidId,
            bidMeta: bidMeta,
            buyType: buyType,
            isTestEnvironment: isTestEnvironment,
            totalViewTime: Float(totalViewTime),
            visibilityRatio: Float(visibilityRatio)
        )
        resolver("Total view event sent")
    }

    @objc public func trackClick(
        campaignId: String,
        adSpaceId: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Bool,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        guard let postCreativeAnalytic = postCreativeAnalytic else {
            rejecter("SDK_NOT_INITIALIZED", "SDK not initialized. Call initializeSdk() first.", nil)
            return
        }
        
        postCreativeAnalytic.trackClick(
            campaignId: campaignId,
            adSpaceId: adSpaceId,
            bidId: bidId,
            bidMeta: bidMeta,
            buyType: buyType,
            isTestEnvironment: isTestEnvironment
        )
        resolver("Click event sent")
    }

    @objc public func trackVideoPlayback(
        campaignId: String,
        adSpaceId: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Bool,
        totalPlaybackTime: Double,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        guard let postCreativeAnalytic = postCreativeAnalytic else {
            rejecter("SDK_NOT_INITIALIZED", "SDK not initialized. Call initializeSdk() first.", nil)
            return
        }
        
        postCreativeAnalytic.trackVideoPlayback(
            campaignId: campaignId,
            adSpaceId: adSpaceId,
            bidId: bidId,
            bidMeta: bidMeta,
            buyType: buyType,
            isTestEnvironment: isTestEnvironment,
            totalPlaybackTime: Float(totalPlaybackTime)
        )
        resolver("Video playback event sent")
    }

    @objc public func trackVideoQuartile(
        campaignId: String,
        adSpaceId: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Bool,
        quartile: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        guard let postCreativeAnalytic = postCreativeAnalytic else {
            rejecter("SDK_NOT_INITIALIZED", "SDK not initialized. Call initializeSdk() first.", nil)
            return
        }
        
        postCreativeAnalytic.trackVideoQuartile(
            campaignId: campaignId,
            adSpaceId: adSpaceId,
            bidId: bidId,
            bidMeta: bidMeta,
            buyType: buyType,
            isTestEnvironment: isTestEnvironment,
            quartile: quartile
        )
        resolver("Video quartile event sent")
    }

    @objc public static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
