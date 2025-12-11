package com.adgeist

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.adgeist.modules.AdgeistImpl

import com.facebook.react.bridge.ReadableMap

class Adgeist internal constructor(reactContext: ReactApplicationContext) :
    NativeAdgeistSpec(reactContext) {

    private var implementation: AdgeistImpl = AdgeistImpl(reactContext)

    override fun getName(): String = AdgeistImpl.NAME

    override fun initializeSdk(customBidRequestBackendDomain: String, customPackageOrBundleID: String, customAdgeistAppID: String, promise: Promise) {
        implementation.initializeSdk(customBidRequestBackendDomain, customPackageOrBundleID, customAdgeistAppID, promise)
    }

    override fun destroySdk(promise: Promise) {
        implementation.destroySdk(promise)
    }

    override fun fetchCreative(adSpaceId: String, buyType: String, isTestEnvironment: Boolean, promise: Promise) {
        implementation.fetchCreative(adSpaceId, buyType, isTestEnvironment, promise)
    }

    override fun trackImpression(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, isTestEnvironment: Boolean, renderTime: Double, promise: Promise) {
        implementation.trackImpression(campaignId, adSpaceId, bidId, bidMeta, buyType, isTestEnvironment, renderTime.toFloat(), promise)
    }

    override fun trackView(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, isTestEnvironment: Boolean, viewTime: Double, visibilityRatio: Double, scrollDepth: Double, timeToVisible: Double, promise: Promise) {
        implementation.trackView(campaignId, adSpaceId, bidId, bidMeta, buyType, isTestEnvironment, viewTime.toFloat(), visibilityRatio.toFloat(), scrollDepth.toFloat(), timeToVisible.toFloat(), promise)
    }

    override fun trackTotalView(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, isTestEnvironment: Boolean, totalViewTime: Double, visibilityRatio: Double, promise: Promise) {
        implementation.trackTotalView(campaignId, adSpaceId, bidId, bidMeta, buyType, isTestEnvironment, totalViewTime.toFloat(), visibilityRatio.toFloat(), promise)
    }

    override fun trackClick(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, isTestEnvironment: Boolean, promise: Promise) {
        implementation.trackClick(campaignId, adSpaceId, bidId, bidMeta, buyType, isTestEnvironment, promise)
    }

    override fun trackVideoPlayback(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, isTestEnvironment: Boolean, totalPlaybackTime: Double, promise: Promise) {
        implementation.trackVideoPlayback(campaignId, adSpaceId, bidId, bidMeta, buyType, isTestEnvironment, totalPlaybackTime.toFloat(), promise)
    }

    override fun trackVideoQuartile(campaignId: String, adSpaceId: String, bidId: String, bidMeta: String, buyType: String, isTestEnvironment: Boolean, quartile: String, promise: Promise) {
        implementation.trackVideoQuartile(campaignId, adSpaceId, bidId, bidMeta, buyType, isTestEnvironment, quartile, promise)
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
