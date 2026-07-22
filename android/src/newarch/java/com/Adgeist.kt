package com.adgeist

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.adgeist.modules.AdgeistImpl
import com.adgeistkit.request.AnalyticsRequest
import com.facebook.react.bridge.ReadableMap

class Adgeist internal constructor(reactContext: ReactApplicationContext) :
    NativeAdgeistSpec(reactContext) {

    private var implementation: AdgeistImpl = AdgeistImpl(reactContext)

    override fun getName(): String = AdgeistImpl.NAME

    override fun initializeSdk(customBidRequestBackendDomain: String?, customPackageOrBundleID: String?, customAdgeistAppID: String?, customVersioning: String? , promise: Promise) {
        implementation.initializeSdk(customBidRequestBackendDomain, customPackageOrBundleID, customAdgeistAppID, customVersioning, promise)
    }

    override fun destroySdk(promise: Promise) {
        implementation.destroySdk(promise)
    }

    override fun fetchCreative(adSpaceId: String, buyType: String, promise: Promise) {
        implementation.fetchCreative(adSpaceId, buyType, promise)
    }

    override fun trackImpression(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, renderTime: Double, promise: Promise) {
        promise.resolve("trackImpression is not supported on Android")
    }

    override fun trackView(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, viewTime: Double, visibilityRatio: Double, scrollDepth: Double, timeToVisible: Double, promise: Promise) {
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

    override fun trackTotalView(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, totalViewTime: Double, promise: Promise) {
        promise.resolve("trackTotalView is not supported on Android")
    }

     override fun trackClick(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, promise: Promise) {
        val request = AnalyticsRequest.AnalyticsRequestBuilder(bidMeta)
          .trackClick()
          .build()

        implementation.sendCreativeAnalytics(request, promise)
     }

     override fun trackVideoPlayback(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, totalPlaybackTime: Double, promise: Promise) {
        promise.resolve("trackVideoPlayback is not supported on Android")
     }

    override fun setUserDetails(userDetails: ReadableMap) {
        implementation.setUserDetails(userDetails)
    }

    override fun logEvent(event: ReadableMap) {
        implementation.logEvent(event)
    }

    override fun getConsentStatus(promise: Promise) {
        implementation.getConsentStatus(promise)
    }

    override fun updateConsentStatus(consent: Boolean) {
        implementation.updateConsentStatus(consent)
    }
}
