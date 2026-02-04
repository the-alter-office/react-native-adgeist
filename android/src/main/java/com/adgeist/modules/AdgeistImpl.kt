package com.adgeist.modules

import android.util.Log
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
import com.adgeist.utils.toWritableMap
import com.adgeistkit.ads.network.AnalyticsRequest
import com.adgeistkit.ads.network.AnalyticsRequestDEPRECATED

class AdgeistImpl internal constructor(private val context: ReactApplicationContext) {

  private var adgeistInstance: AdgeistCore? = null
  private var getAd: FetchCreative? = null
  private var postCreativeAnalytic: CreativeAnalytics? = null

  fun initializeSdk(customBidRequestBackendDomain: String?, customPackageOrBundleID: String?, customAdgeistAppID: String?, customVersioning: String?, promise: Promise) {
    try {
      adgeistInstance = AdgeistCore.initialize(context.applicationContext, customBidRequestBackendDomain, customPackageOrBundleID, customAdgeistAppID, customVersioning)
      getAd = adgeistInstance?.getCreative()
      postCreativeAnalytic = adgeistInstance?.postCreativeAnalytics()
      promise.resolve("SDK initialized with domain: ${customBidRequestBackendDomain ?: "default"}")
    } catch (e: Exception) {
      promise.reject("INIT_FAILED", "SDK initialization failed", e)
    }
  }

  fun destroySdk(promise: Promise) {
    AdgeistCore.destroy()
    promise.resolve("SDK destroyed")
  }

  fun fetchCreative(adSpaceId: String, buyType: String, isTestEnvironment: Boolean, promise: Promise) {
    getAd?.fetchCreative(adSpaceId, buyType, isTestEnvironment) { adData ->
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

  fun sendCreativeAnalytics(analyticsRequestDEPRECATED : AnalyticsRequestDEPRECATED, promise: Promise) {
    postCreativeAnalytic?.sendTrackingData(analyticsRequestDEPRECATED)
    promise.resolve("Event sent successfully")
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

  companion object {
    const val NAME = "Adgeist"
  }
}

fun ReadableMap.getStringSafe(key: String): String? =
    if (this.hasKey(key) && !this.isNull(key)) this.getString(key) else null
