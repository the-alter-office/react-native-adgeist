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

    @objc public func sendCreativeAnalytic(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        eventType: String,
        origin: String,
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

        postCreativeAnalytic.sendTrackingData(
            campaignId: campaignId,
            adSpaceId: adSpaceId,
            publisherId: publisherId,
            eventType: eventType,
            origin: origin,
            apiKey: apiKey,
            bidId: bidId,
            isTestEnvironment: isTestEnvironment
        ) { response in
            if let response = response {
                resolver(response)
            } else {
                rejecter("NO_AD", "Couldn't find the campaign to update analytics", nil)
            }
        }
    }

    @objc public func setUserDetails(_ userDetailsDict: [String: Any]) {
        let userDetails = UserDetails(
            userId: userDetailsDict["userId"] as? String,
            userName: userDetailsDict["userName"] as? String,
            email: userDetailsDict["email"] as? String,
            phone: userDetailsDict["phone"] as? String
        )
        adgeistInstance?.setUserDetails(userDetails)
    }

    @objc public func updateConsentStatus(_ consent: Bool) {
        adgeistInstance?.updateConsentStatus(consent)
    }


    @objc public func logEvent(_ eventDict: NSDictionary) {
        print("Event must have a non-empty eventType")
        guard let eventType = eventDict["eventType"] as? String, !eventType.isEmpty else {
            print("Event must have a non-empty eventType")
            return
        }

        let eventProps = eventDict["eventProperties"] as? [String: Any] ?? [:]
        let event = Event(eventType: eventType, eventProperties: eventProps)
        adgeistInstance?.logEvent(event)
    }

    @objc public static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
