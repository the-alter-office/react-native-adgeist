import Foundation
import AdgeistKit
import React

@objc public class AdgeistImpl: NSObject {
    private static let adGeist = AdgeistCore.shared
    @objc public func fetchCreative(
        apiKey: String,
        origin: String,
        adSpaceId: String,
        publisherId: String,
        isTestEnvironment: Bool,
        resolver: @escaping RCTPromiseResolveBlock, 
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        AdgeistImpl.adGeist.getCreative().fetchCreative(
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
        AdgeistImpl.adGeist.postCreativeAnalytics().sendTrackingData(
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

    @objc public static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
