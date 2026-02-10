package com.adgeist

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.adgeist.implementation.AdgeistModuleImpl
import com.facebook.react.bridge.ReadableMap

class AdgeistModule internal constructor(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    private var implementation: AdgeistModuleImpl = AdgeistModuleImpl(reactContext)

    override fun getName(): String = AdgeistModuleImpl.NAME

    @ReactMethod
    fun initializeSdk(customDomain: String, promise: Promise) {
        implementation.initializeSdk(customDomain, promise)   
    }

    @ReactMethod
    fun fetchCreative(apiKey: String, origin: String, adSpaceId: String, publisherId: String, isTestEnvironment: Boolean, promise: Promise) {
        implementation.fetchCreative(apiKey, origin, adSpaceId, publisherId, isTestEnvironment, promise)
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

    @ReactMethod
    fun trackImpression(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
        isTestEnvironment: Boolean,
        renderTime: Double,
        promise: Promise
    ) {
        implementation.trackImpression(
            campaignId, adSpaceId, publisherId, apiKey, bidId, isTestEnvironment, renderTime.toFloat(), promise
        )
    }

    @ReactMethod
    fun trackView(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
        isTestEnvironment: Boolean,
        viewTime: Double,
        visibilityRatio: Double,
        scrollDepth: Double,
        timeToVisible: Double,
        promise: Promise
    ) {
        implementation.trackView(
            campaignId, adSpaceId, publisherId, apiKey, bidId, isTestEnvironment,
            viewTime.toFloat(), visibilityRatio.toFloat(), scrollDepth.toFloat(), timeToVisible.toFloat(), promise
        )
    }

    @ReactMethod
    fun trackTotalView(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
        isTestEnvironment: Boolean,
        totalViewTime: Double,
        visibilityRatio: Double,
        promise: Promise
    ) {
        implementation.trackTotalView(
            campaignId, adSpaceId, publisherId, apiKey, bidId, isTestEnvironment,
            totalViewTime.toFloat(), visibilityRatio.toFloat(), promise
        )
    }

    @ReactMethod
    fun trackClick(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
        isTestEnvironment: Boolean,
        promise: Promise
    ) {
        implementation.trackClick(
            campaignId, adSpaceId, publisherId, apiKey, bidId, isTestEnvironment, promise
        )
    }

    @ReactMethod
    fun trackVideoPlayback(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
        isTestEnvironment: Boolean,
        totalPlaybackTime: Double,
        promise: Promise
    ) {
        implementation.trackVideoPlayback(
            campaignId, adSpaceId, publisherId, apiKey, bidId, isTestEnvironment, totalPlaybackTime.toFloat(), promise
        )
    }

    @ReactMethod
    fun trackVideoQuartile(
        campaignId: String,
        adSpaceId: String,
        publisherId: String,
        apiKey: String,
        bidId: String,
        isTestEnvironment: Boolean,
        quartile: String,
        promise: Promise
    ) {
        implementation.trackVideoQuartile(
            campaignId, adSpaceId, publisherId, apiKey, bidId, isTestEnvironment, quartile, promise
        )
    }

    @ReactMethod
    fun trackDeeplinkUtm(url: String) {
        implementation.trackDeeplinkUtm(url)
    }
}