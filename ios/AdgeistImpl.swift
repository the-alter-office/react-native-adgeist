import Foundation
import AdgeistKit
import React

@objc public class AdgeistImpl: NSObject {
    private var adgeistInstance: AdgeistCore?
    private var getAd: FetchCreative?
    private var postCreativeAnalytic: CreativeAnalytics?
    
    @objc public func initializeSdk(
        customDomain: String?,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        do {
            adgeistInstance = AdgeistCore.initialize(customDomain: customDomain ?? "bg-services-api.adgeist.ai")
            getAd = adgeistInstance?.getCreative()
            postCreativeAnalytic = adgeistInstance?.postCreativeAnalytics()
            resolver("SDK initialized with domain: \(customDomain ?? "default")")
        } catch {
            rejecter("INIT_FAILED", "SDK initialization failed", error)
        }
    }

    @objc public func fetchCreative(
        apiKey: String,
        origin: String,
        adSpaceId: String,
        publisherId: String,
        isTestEnvironment: Bool,
        resolver: @escaping RCTPromiseResolveBlock, 
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        guard let getAd = getAd else {
            rejecter("SDK_NOT_INITIALIZED", "SDK not initialized. Call initializeSdk() first.", nil)
            return
        }

        getAd.fetchCreative(
            apiKey: apiKey,
            origin: origin,
            adSpaceId: adSpaceId,
            companyId: publisherId,
            isTestEnvironment: isTestEnvironment
        ) { creativeData in
            if let creativeData = creativeData {
                do {
                    let encoder = JSONEncoder()
                    let data = try encoder.encode(creativeData)
                    if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                    resolver(json)
                    } else {
                        rejecter("JSON_ERROR", "Failed to convert ad data to JSON", nil)
                    }
                } catch {
                    rejecter("JSON_ERROR", "Failed to encode ad data", error)
                }
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
        publisherId: String,
        apiKey: String,
        bidId: String,
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
            publisherId: publisherId,
            apiKey: apiKey,
            bidId: bidId,
            isTestEnvironment: isTestEnvironment,
            renderTime: Float(renderTime)
        )
        resolver("Impression event sent")
    }

    @objc public func trackView(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
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
            publisherId: publisherId,
            apiKey: apiKey,
            bidId: bidId,
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
        publisherId: String,
        apiKey: String,
        bidId: String,
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
            publisherId: publisherId,
            apiKey: apiKey,
            bidId: bidId,
            isTestEnvironment: isTestEnvironment,
            totalViewTime: Float(totalViewTime),
            visibilityRatio: Float(visibilityRatio)
        )
        resolver("Total view event sent")
    }

    @objc public func trackClick(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
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
            publisherId: publisherId,
            apiKey: apiKey,
            bidId: bidId,
            isTestEnvironment: isTestEnvironment
        )
        resolver("Click event sent")
    }

    @objc public func trackVideoPlayback(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
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
            publisherId: publisherId,
            apiKey: apiKey,
            bidId: bidId,
            isTestEnvironment: isTestEnvironment,
            totalPlaybackTime: Float(totalPlaybackTime)
        )
        resolver("Video playback event sent")
    }

    @objc public func trackVideoQuartile(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
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
            publisherId: publisherId,
            apiKey: apiKey,
            bidId: bidId,
            isTestEnvironment: isTestEnvironment,
            quartile: quartile
        )
        resolver("Video quartile event sent")
    }

    @objc public static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
