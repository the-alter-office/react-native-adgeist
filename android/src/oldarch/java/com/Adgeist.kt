package com.adgeist

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.adgeist.modules.AdgeistImpl
import com.adgeistkit.request.AnalyticsRequest
import com.facebook.react.bridge.ReadableMap

class Adgeist internal constructor(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var implementation: AdgeistImpl = AdgeistImpl(reactContext)

    override fun getName(): String = AdgeistImpl.NAME

    @ReactMethod
    fun initializeSdk(customBidRequestBackendDomain: String?, customPackageOrBundleID: String?, customAdgeistAppID: String?, customVersioning: String?, promise: Promise) {
        implementation.initializeSdk(customBidRequestBackendDomain, customPackageOrBundleID, customAdgeistAppID, customVersioning, promise)
    }

    @ReactMethod
    fun destroySdk(promise: Promise) {
        implementation.destroySdk(promise)
    }

    @ReactMethod
    fun fetchCreative(adSpaceId: String, buyType: String, promise: Promise) {
        implementation.fetchCreative(adSpaceId, buyType, promise)
    }

    @ReactMethod
    fun trackImpression(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, renderTime: Double, promise: Promise) {
        promise.resolve("trackImpression is not supported on Android")
    }

    @ReactMethod
    fun trackView(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, viewTime: Double, visibilityRatio: Double, scrollDepth: Double, timeToVisible: Double, promise: Promise) {
        val request = AnalyticsRequest.AnalyticsRequestBuilder(bidMeta)
          .trackViewableImpression(
            timeToVisible.toLong(),
            scrollDepth.toFloat(),
            visibilityRatio.toFloat(),
            viewTime.toLong()
          )
          .build()

        implementation.sendCreativeAnalytics(request, promise)
    }

    @ReactMethod
    fun trackTotalView(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, totalViewTime: Double, visibilityRatio: Double, promise: Promise) {
        promise.resolve("trackTotalView is not supported on Android")
    }

    @ReactMethod
    fun trackClick(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, promise: Promise) {
        val request = AnalyticsRequest.AnalyticsRequestBuilder(bidMeta)
          .trackClick()
          .build()

        implementation.sendCreativeAnalytics(request, promise)
    }

    @ReactMethod
    fun trackVideoPlayback(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, totalPlaybackTime: Double, promise: Promise) {
        promise.resolve("trackVideoPlayback is not supported on Android")
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
