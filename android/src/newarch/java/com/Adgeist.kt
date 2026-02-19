package com.adgeist

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.adgeist.modules.AdgeistImpl
import com.adgeistkit.request.AnalyticsRequestDEPRECATED
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

    override fun fetchCreative(adSpaceId: String, buyType: String, isTestEnvironment: Boolean, promise: Promise) {
        implementation.fetchCreative(adSpaceId, buyType, isTestEnvironment, promise)
    }

    override fun trackImpression(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, isTestEnvironment: Boolean, renderTime: Double, promise: Promise) {
        var builder =  AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(adSpaceId, isTestEnvironment)

        builder = when (buyType.uppercase()) {
          "CPM" -> builder.buildCPMRequest(campaignId, bidId)
          "FIXED" -> builder.buildFIXEDRequest(bidMeta)
          else -> builder
        }

        implementation.sendCreativeAnalytics(builder.trackImpression(renderTime.toFloat()).build(), promise)
    }

    override fun trackView(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, isTestEnvironment: Boolean, viewTime: Double, visibilityRatio: Double, scrollDepth: Double, timeToVisible: Double, promise: Promise) {
        var builder =  AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(adSpaceId, isTestEnvironment)

        builder = when (buyType.uppercase()) {
          "CPM" -> builder.buildCPMRequest(campaignId, bidId)
          "FIXED" -> builder.buildFIXEDRequest(bidMeta)
          else -> builder
        }

        implementation.sendCreativeAnalytics(
          builder.trackViewableImpression(timeToVisible.toFloat(),
            scrollDepth.toFloat(),
            visibilityRatio.toFloat(),
            viewTime.toFloat()).build(),
          promise
        )
    }

    override fun trackTotalView(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, isTestEnvironment: Boolean, totalViewTime: Double, promise: Promise) {
        var builder =  AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(adSpaceId, isTestEnvironment)

        builder = when (buyType.uppercase()) {
          "CPM" -> builder.buildCPMRequest(campaignId, bidId)
          "FIXED" -> builder.buildFIXEDRequest(bidMeta)
          else -> builder
        }

        implementation.sendCreativeAnalytics(
          builder.trackTotalViewTime(totalViewTime.toFloat()).build(),
          promise
        )
    }

     override fun trackClick(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, isTestEnvironment: Boolean, promise: Promise) {
        var builder =  AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(adSpaceId, isTestEnvironment)

        builder = when (buyType.uppercase()) {
          "CPM" -> builder.buildCPMRequest(campaignId, bidId)
          "FIXED" -> builder.buildFIXEDRequest(bidMeta)
          else -> builder
        }

        implementation.sendCreativeAnalytics(
          builder.trackClick().build(),
          promise
        )
     }

     override fun trackVideoPlayback(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, isTestEnvironment: Boolean, totalPlaybackTime: Double, promise: Promise) {
        var builder =  AnalyticsRequestDEPRECATED.AnalyticsRequestBuilderDEPRECATED(adSpaceId, isTestEnvironment)

        builder = when (buyType.uppercase()) {
          "CPM" -> builder.buildCPMRequest(campaignId, bidId)
          "FIXED" -> builder.buildFIXEDRequest(bidMeta)
          else -> builder
        }

        implementation.sendCreativeAnalytics(
          builder.trackTotalPlaybackTime(totalPlaybackTime.toFloat()).build(),
          promise
        )
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

    override fun trackDeeplinkUtm(url: String) {
        implementation.trackDeeplinkUtm(url)
    }
}
