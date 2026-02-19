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
        customVersioning: String?,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        do {
            adgeistInstance = AdgeistCore.initialize(customBidRequestBackendDomain: customBidRequestBackendDomain,
                                                     customPackageOrBundleID: customPackageOrBundleID,
                                                     customAdgeistAppID: customAdgeistAppID,
                                                     customVersioning: customVersioning)
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
            adUnitID: adSpaceId,
            buyType: buyType,
            isTestEnvironment: isTestEnvironment
        ) { creativeData in
            var result: [String: Any] = [:]
            
            // Use Mirror to reflect the object's properties
            let mirror = Mirror(reflecting: creativeData)
            for child in mirror.children {
                if let label = child.label {
                    result[label] = child.value
                }
            }
            
            resolver(result)
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

    @objc public func trackDeeplinkUtm(url: String) {
        guard let urlObj = URL(string: url) else {
            print("Invalid URL provided for UTM tracking")
            return
        }
        adgeistInstance?.trackDeeplink(url: urlObj)
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

    public func sendCreativeAnalytics(
        analyticsRequest: AnalyticsRequestDEPRECATED,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        postCreativeAnalytic?.sendTrackingData(analyticsRequestDEPRECATED: analyticsRequest)
        resolver("Event sent successfully")
    }

    @objc public func trackImpression(
        campaignId: String,
        adSpaceId: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Bool,
        renderTime: Float,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        var builder = AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(adUnitID: adSpaceId, isTestMode: isTestEnvironment)
        
        let upperBuyType = buyType.uppercased()
        if upperBuyType == "CPM" {
            builder = builder.buildCPMRequest(campaignID: campaignId, bidID: bidId)
        } else if upperBuyType == "FIXED" {
            builder = builder.buildFIXEDRequest(metaData: bidMeta)
        }
        
        let request = builder.trackImpression(renderTime: renderTime).build()
        sendCreativeAnalytics(analyticsRequest: request, resolver: resolver, rejecter: rejecter)
    }

    @objc public func trackView(
        campaignId: String,
        adSpaceId: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Bool,
        viewTime: Float,
        visibilityRatio: Float,
        scrollDepth: Float,
        timeToVisible: Float,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        var builder = AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(adUnitID: adSpaceId, isTestMode: isTestEnvironment)
        
        let upperBuyType = buyType.uppercased()
        if upperBuyType == "CPM" {
            builder = builder.buildCPMRequest(campaignID: campaignId, bidID: bidId)
        } else if upperBuyType == "FIXED" {
            builder = builder.buildFIXEDRequest(metaData: bidMeta)
        }
        
        let request = builder.trackViewableImpression(
            timeToVisible: timeToVisible,
            scrollDepth: scrollDepth,
            visibilityRatio: visibilityRatio,
            viewTime: viewTime
        ).build()
        sendCreativeAnalytics(analyticsRequest: request, resolver: resolver, rejecter: rejecter)
    }

    @objc public func trackTotalView(
        campaignId: String,
        adSpaceId: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Bool,
        totalViewTime: Float,
        visibilityRatio: Float,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        var builder = AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(adUnitID: adSpaceId, isTestMode: isTestEnvironment)
        
        let upperBuyType = buyType.uppercased()
        if upperBuyType == "CPM" {
            builder = builder.buildCPMRequest(campaignID: campaignId, bidID: bidId)
        } else if upperBuyType == "FIXED" {
            builder = builder.buildFIXEDRequest(metaData: bidMeta)
        }
        
        let request = builder.trackTotalViewTime(totalViewTime: totalViewTime).build()
        sendCreativeAnalytics(analyticsRequest: request, resolver: resolver, rejecter: rejecter)
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
        var builder = AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(adUnitID: adSpaceId, isTestMode: isTestEnvironment)
        
        let upperBuyType = buyType.uppercased()
        if upperBuyType == "CPM" {
            builder = builder.buildCPMRequest(campaignID: campaignId, bidID: bidId)
        } else if upperBuyType == "FIXED" {
            builder = builder.buildFIXEDRequest(metaData: bidMeta)
        }
        
        let request = builder.trackClick().build()
        sendCreativeAnalytics(analyticsRequest: request, resolver: resolver, rejecter: rejecter)
    }

    @objc public func trackVideoPlayback(
        campaignId: String,
        adSpaceId: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Bool,
        totalPlaybackTime: Float,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        var builder = AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(adUnitID: adSpaceId, isTestMode: isTestEnvironment)
        
        let upperBuyType = buyType.uppercased()
        if upperBuyType == "CPM" {
            builder = builder.buildCPMRequest(campaignID: campaignId, bidID: bidId)
        } else if upperBuyType == "FIXED" {
            builder = builder.buildFIXEDRequest(metaData: bidMeta)
        }
        
        let request = builder.trackTotalPlaybackTime(totalPlaybackTime: totalPlaybackTime).build()
        sendCreativeAnalytics(analyticsRequest: request, resolver: resolver, rejecter: rejecter)
    }

//    @objc public func trackVideoQuartile(
//        campaignId: String,
//        adSpaceId: String,
//        bidId: String,
//        bidMeta: String,
//        buyType: String,
//        isTestEnvironment: Bool,
//        quartile: String,
//        resolver: @escaping RCTPromiseResolveBlock,
//        rejecter: @escaping RCTPromiseRejectBlock
//    ) {
//        var builder = AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(adUnitID: adSpaceId, isTestMode: isTestEnvironment)
//        
//        let upperBuyType = buyType.uppercased()
//        if upperBuyType == "CPM" {
//            builder = builder.buildCPMRequest(campaignID: campaignId, bidID: bidId)
//        } else if upperBuyType == "FIXED" {
//            builder = builder.buildFIXEDRequest(metaData: bidMeta)
//        }
//        
//        let request = builder.trackVideoQuartile(quartile: quartile).build()
//        sendCreativeAnalytics(analyticsRequest: request, resolver: resolver, rejecter: rejecter)
//    }

    @objc public static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
