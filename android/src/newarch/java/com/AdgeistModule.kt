package com.adgeist

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.adgeist.implementation.AdgeistModuleImpl

import com.facebook.react.bridge.ReadableMap

class AdgeistModule internal constructor(reactContext: ReactApplicationContext) :
    NativeAdgeistSpec(reactContext) {

    private var implementation: AdgeistModuleImpl = AdgeistModuleImpl(reactContext)

    override fun getName(): String = AdgeistModuleImpl.NAME

    override fun initializeSdk(customDomain: String, promise: Promise) {
        implementation.initializeSdk(customDomain, promise)
    }

    override fun fetchCreative(apiKey: String, origin: String, adSpaceId: String, publisherId: String, buyType: String, isTestEnvironment: Boolean, promise: Promise) {
        implementation.fetchCreative(apiKey, origin, adSpaceId, publisherId, buyType, isTestEnvironment, promise)
    }

    override fun trackImpression(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Boolean,
        renderTime: Double,
        promise: Promise
    ) {
        implementation.trackImpression(
            campaignId, adSpaceId, publisherId, apiKey, bidId, bidMeta, buyType, isTestEnvironment, renderTime.toFloat(), promise
        )
    }

    override fun trackView(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Boolean,
        viewTime: Double,
        visibilityRatio: Double,
        scrollDepth: Double,
        timeToVisible: Double,
        promise: Promise
    ) {
        implementation.trackView(
            campaignId, adSpaceId, publisherId, apiKey, bidId, bidMeta, buyType, isTestEnvironment,
            viewTime.toFloat(), visibilityRatio.toFloat(), scrollDepth.toFloat(), timeToVisible.toFloat(), promise
        )
    }

    override fun trackTotalView(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Boolean,
        totalViewTime: Double,
        visibilityRatio: Double,
        promise: Promise
    ) {
        implementation.trackTotalView(
            campaignId, adSpaceId, publisherId, apiKey, bidId, bidMeta, buyType, isTestEnvironment,
            totalViewTime.toFloat(), visibilityRatio.toFloat(), promise
        )
    }

    override fun trackClick(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Boolean,
        promise: Promise
    ) {
        implementation.trackClick(
            campaignId, adSpaceId, publisherId, apiKey, bidId, bidMeta, buyType, isTestEnvironment, promise
        )
    }

    override fun trackVideoPlayback(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Boolean,
        totalPlaybackTime: Double,
        promise: Promise
    ) {
        implementation.trackVideoPlayback(
            campaignId, adSpaceId, publisherId, apiKey, bidId, bidMeta, buyType, isTestEnvironment, totalPlaybackTime.toFloat(), promise
        )
    }

    override fun trackVideoQuartile(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
        bidMeta: String,
        buyType: String,
        isTestEnvironment: Boolean,
        quartile: String,
        promise: Promise
    ) {
        implementation.trackVideoQuartile(
            campaignId, adSpaceId, publisherId, apiKey, bidId, bidMeta, buyType, isTestEnvironment, quartile, promise
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
}
