package com.adgeist.implementation

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.adgeistkit.AdgeistCore
import com.adgeistkit.data.models.CPMAdResponse
import com.adgeistkit.data.models.Event
import com.adgeistkit.data.models.FixedAdResponse
import com.adgeistkit.data.models.UserDetails
import com.adgeistkit.data.network.CreativeAnalytics
import com.adgeistkit.data.network.FetchCreative

import com.facebook.react.bridge.ReadableMap

class AdgeistModuleImpl internal constructor(private val context: ReactApplicationContext) {

  private var adgeistInstance: AdgeistCore? = null
  private var getAd: FetchCreative? = null
  private var postCreativeAnalytic: CreativeAnalytics? = null

  fun initializeSdk(customDomain: String?, promise: Promise) {
    try {
      adgeistInstance = AdgeistCore.initialize(context.applicationContext, customDomain)
      getAd = adgeistInstance?.getCreative()
      postCreativeAnalytic = adgeistInstance?.postCreativeAnalytics()
      promise.resolve("SDK initialized with domain: ${customDomain ?: "default"}")
    } catch (e: Exception) {
      promise.reject("INIT_FAILED", "SDK initialization failed", e)
    }
  }

  fun fetchCreative(apiKey: String, origin: String, adSpaceId: String, publisherId: String, buyType: String, isTestEnvironment: Boolean, promise: Promise) {
    getAd?.fetchCreative(apiKey, origin, adSpaceId, publisherId, buyType, isTestEnvironment) { adData ->
      if (adData != null) {
        when (adData) {
          is CPMAdResponse -> {
            promise.resolve(adData.toWritableMap())
          }
          is FixedAdResponse -> {
            promise.resolve(adData.toWritableMap())
          }
          else -> {
            promise.resolve(null)
          }
        }
      } else {
        promise.reject("NO_AD", "Ad data not available")
      }
    } ?: promise.reject("NOT_INITIALIZED", "SDK not initialized")
  }

  fun setUserDetails(userDetailsMap: ReadableMap) {
    val userDetails = UserDetails(
        userId = userDetailsMap.getStringSafe("userId"),
        userName = userDetailsMap.getStringSafe("userName"),
        email = userDetailsMap.getStringSafe("email"),
        phone = userDetailsMap.getStringSafe("phone")
    )
    adgeistInstance?.setUserDetails(userDetails)
  }

  fun logEvent(eventMap: ReadableMap) {
    val eventType = eventMap.getStringSafe("eventType")

    if (eventType.isNullOrEmpty()) {
        throw IllegalArgumentException("Event must have a non-empty eventType")
    }

    val props = if (eventMap.hasKey("eventProperties")) eventMap.getMap("eventProperties") else null
    val eventProps = props?.toHashMap() ?: emptyMap<String, Any>()

    val event = Event(
        eventType = eventType,
        eventProperties = eventProps
    )
    adgeistInstance?.logEvent(event)
  }

  fun getConsentStatus(promise: Promise) {
    try {
        val consent = adgeistInstance?.getConsentStatus() ?: false
        promise.resolve(consent)
    } catch (e: Exception) {
        promise.reject("CONSENT_ERROR", "Failed to get consent status", e)
    }
}

  fun updateConsentStatus(consent: Boolean) {
    adgeistInstance?.updateConsentStatus(consent)
  }

  fun trackImpression(
    campaignId: String,
    adSpaceId: String,
    publisherId: String,
    apiKey: String,
    bidId: String,
    bidMeta: String,
    buyType: String,
    isTestEnvironment: Boolean,
    renderTime: Float,
    promise: Promise
  ) {
    postCreativeAnalytic?.trackImpression(
      campaignId, adSpaceId, publisherId, apiKey, bidId, bidMeta, buyType, isTestEnvironment, renderTime
    )
    promise.resolve("Impression event sent")
  }

  fun trackView(
    campaignId: String,
    adSpaceId: String,
    publisherId: String,
    apiKey: String,
    bidId: String,
    bidMeta: String,
    buyType: String,
    isTestEnvironment: Boolean,
    viewTime: Float,
    visibilityRatio: Float,
    scrollDepth: Float,
    timeToVisible: Float,
    promise: Promise
  ) {
    postCreativeAnalytic?.trackView(
      campaignId, adSpaceId, publisherId, apiKey, bidId,  bidMeta, buyType, isTestEnvironment,
      viewTime, visibilityRatio, scrollDepth, timeToVisible
    )
    promise.resolve("View event sent")
  }

  fun trackTotalView(
    campaignId: String,
    adSpaceId: String,
    publisherId: String,
    apiKey: String,
    bidId: String,
    bidMeta: String,
    buyType: String,
    isTestEnvironment: Boolean,
    totalViewTime: Float,
    visibilityRatio: Float,
    promise: Promise
  ) {
    postCreativeAnalytic?.trackTotalView(
      campaignId, adSpaceId, publisherId, apiKey, bidId,  bidMeta, buyType, isTestEnvironment,
      totalViewTime, visibilityRatio
    )
    promise.resolve("Total view event sent")
  }

  fun trackClick(
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
    postCreativeAnalytic?.trackClick(
      campaignId, adSpaceId, publisherId, apiKey, bidId,  bidMeta, buyType, isTestEnvironment
    )
    promise.resolve("Click event sent")
  }

  fun trackVideoPlayback(
    campaignId: String,
    adSpaceId: String,
    publisherId: String,
    apiKey: String,
    bidId: String,
    bidMeta: String,
    buyType: String,
    isTestEnvironment: Boolean,
    totalPlaybackTime: Float,
    promise: Promise
  ) {
    postCreativeAnalytic?.trackVideoPlayback(
      campaignId, adSpaceId, publisherId, apiKey, bidId,  bidMeta, buyType, isTestEnvironment, totalPlaybackTime
    )
    promise.resolve("Video playback event sent")
  }

  fun trackVideoQuartile(
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
    postCreativeAnalytic?.trackVideoQuartile(
      campaignId, adSpaceId, publisherId, apiKey, bidId,  bidMeta, buyType, isTestEnvironment, quartile
    )
    promise.resolve("Video quartile event sent")
  }

  companion object {
    const val NAME = "Adgeist"
  }
}

fun ReadableMap.getStringSafe(key: String): String? =
    if (this.hasKey(key) && !this.isNull(key)) this.getString(key) else null
