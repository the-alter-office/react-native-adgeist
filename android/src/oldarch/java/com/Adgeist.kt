package com.adgeist

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.adgeist.modules.AdgeistImpl
import com.adgeistkit.ads.network.AnalyticsRequestDEPRECATED
import com.facebook.react.bridge.ReadableMap

class Adgeist internal constructor(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var implementation: AdgeistImpl = AdgeistImpl(reactContext)

    override fun getName(): String = AdgeistImpl.NAME

    @ReactMethod
    fun initializeSdk(customBidRequestBackendDomain: String, customPackageOrBundleID: String, customAdgeistAppID: String, promise: Promise) {
        implementation.initializeSdk(customBidRequestBackendDomain, customPackageOrBundleID, customAdgeistAppID, promise)
    }

    @ReactMethod
    fun destroySdk(promise: Promise) {
        implementation.destroySdk(promise)
    }

    @ReactMethod
    fun fetchCreative(adSpaceId: String, buyType: String, isTestEnvironment: Boolean, promise: Promise) {
        implementation.fetchCreative(adSpaceId, buyType, isTestEnvironment, promise)
    }

    @ReactMethod
    fun trackImpression(campaignId: String, adSpaceId: String, bidId: String, isTestEnvironment: Boolean, renderTime: Double, promise: Promise) {
        implementation.sendCreativeAnalytics(
          AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(campaignId, adSpaceId, bidId, isTestEnvironment)
            .trackImpression(renderTime.toFloat()).build(),
          promise
        )
    }

    @ReactMethod
    fun trackView(campaignId: String, adSpaceId: String, bidId: String, isTestEnvironment: Boolean, viewTime: Double, visibilityRatio: Double, scrollDepth: Double, timeToVisible: Double, promise: Promise) {
          implementation.sendCreativeAnalytics(
            AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(campaignId, adSpaceId, bidId, isTestEnvironment)
              .trackViewableImpression(timeToVisible.toFloat(),
                scrollDepth.toFloat(),
                visibilityRatio.toFloat(),
                viewTime.toFloat())
              .build(),
            promise
          )
    }

    @ReactMethod
    fun trackTotalView(campaignId: String, adSpaceId: String, bidId: String, isTestEnvironment: Boolean, totalViewTime: Double, visibilityRatio: Double, promise: Promise) {
          implementation.sendCreativeAnalytics(
            AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(campaignId, adSpaceId, bidId, isTestEnvironment)
              .trackTotalViewTime(totalViewTime.toFloat()).build(),
            promise
          )
    }

    @ReactMethod
    fun trackClick(campaignId: String, adSpaceId: String, bidId: String, isTestEnvironment: Boolean, promise: Promise) {
          implementation.sendCreativeAnalytics(
            AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(campaignId, adSpaceId, bidId, isTestEnvironment)
              .trackClick().build(),
            promise
          )
    }

    @ReactMethod
    fun trackVideoPlayback(campaignId: String, adSpaceId: String, bidId: String, isTestEnvironment: Boolean, totalPlaybackTime: Double, promise: Promise) {
        implementation.sendCreativeAnalytics(
          AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(campaignId, adSpaceId, bidId, isTestEnvironment)
            .trackTotalPlaybackTime(totalPlaybackTime.toFloat()).build(),
          promise
        )
    }

    @ReactMethod
    fun setUserDetails(userDetails: ReadableMap) {
        implementation.setUserDetails(userDetails)
    }

    @ReactMethod
    fun logEvent(event: ReadableMap) {
        implementation.logEvent(event)
    }

    @ReactMethod
    fun getConsentStatus(promise: Promise) {
        implementation.getConsentStatus(promise)
    }

    @ReactMethod
    fun updateConsentStatus(consent: Boolean) {
        implementation.updateConsentStatus(consent)
    }
}
