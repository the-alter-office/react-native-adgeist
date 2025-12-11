package com.adgeist.components

import android.util.Log
import android.view.View
import androidx.annotation.RequiresPermission
import com.adgeistkit.ads.AdListener
import com.adgeistkit.ads.AdSize
import com.adgeistkit.ads.AdView
import com.adgeistkit.ads.network.AdRequest
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

object HTML5AdViewManagerImpl {
    const val NAME = "HTML5AdNativeComponent"
    private const val TAG = "HTML5AdViewManagerImpl"

    const val EVENT_AD_LOADED = "onAdLoaded"
    const val EVENT_AD_FAILED_TO_LOAD = "onAdFailedToLoad"
    const val EVENT_AD_OPENED = "onAdOpened"
    const val EVENT_AD_CLOSED = "onAdClosed"
    const val EVENT_AD_CLICKED = "onAdClicked"

    fun createViewInstance(reactContext: ThemedReactContext): AdView {
        return AdView(reactContext)
    }

    fun setAdUnitID(view: AdView, adUnitID: String?) {
        if (adUnitID != null) {
            view.adUnitId = adUnitID
        }
    }

    fun setAdSize(view: AdView, adSizeMap: ReadableMap?) {
        if (adSizeMap != null) {
            try {
                val width = if (adSizeMap.hasKey("width")) adSizeMap.getInt("width") else 360
                val height = if (adSizeMap.hasKey("height")) adSizeMap.getInt("height") else 360

                val adSize = when {
                    adSizeMap.hasKey("type") -> {
                        when (adSizeMap.getString("type")) {
                            "BANNER" -> AdSize.BANNER
                            "LARGE_BANNER" -> AdSize.LARGE_BANNER
                            "MEDIUM_RECTANGLE" -> AdSize.MEDIUM_RECTANGLE
                            "FULL_BANNER" -> AdSize.FULL_BANNER
                            "LEADERBOARD" -> AdSize.LEADERBOARD
                            "WIDE_SKYSCRAPER" -> AdSize.WIDE_SKYSCRAPER
                            else -> AdSize(width, height)
                        }
                    }
                    else -> AdSize(width, height)
                }

                view.setAdDimension(adSize)
            } catch (e: Exception) {
                Log.e(TAG, "Error setting ad size", e)
            }
        }
    }

    fun setAdType(view: AdView, adType: String?) {
        if (adType != null) {
            view.adType = adType
        }
    }

    @RequiresPermission("android.permission.INTERNET")
    fun loadAd(view: AdView, isTestMode: Boolean) {
        try {
            val adRequestBuilder = AdRequest.Builder()
            adRequestBuilder.setTestMode(isTestMode)


            val adRequest = adRequestBuilder.build()

            view.setAdListener(object : AdListener() {
                override fun onAdLoaded() {
                  view.post {
                    sendEvent(view, EVENT_AD_LOADED, Arguments.createMap())
                    measureAndLayout(view)
                  }
                }

                override fun onAdFailedToLoad(error: String) {
                    val event = Arguments.createMap().apply {
                        putString("error", error)
                    }
                    sendEvent(view, EVENT_AD_FAILED_TO_LOAD, event)
                }

                override fun onAdOpened() {
                    sendEvent(view, EVENT_AD_OPENED, Arguments.createMap())
                }

                override fun onAdClosed() {
                    sendEvent(view, EVENT_AD_CLOSED, Arguments.createMap())
                }

                override fun onAdClicked() {
                    sendEvent(view, EVENT_AD_CLICKED, Arguments.createMap())
                }
            })

            view.loadAd(adRequest)
        } catch (e: Exception) {
            val event = Arguments.createMap().apply {
                putString("error", e.message ?: "Unknown error")
            }
            sendEvent(view, EVENT_AD_FAILED_TO_LOAD, event)
        }
    }

    fun destroyAd(view: AdView) {
        view.destroy()
    }

    private fun measureAndLayout(view: AdView) {
        view.measure(
            View.MeasureSpec.makeMeasureSpec(view.width, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(view.height, View.MeasureSpec.EXACTLY)
        )
        view.layout(view.left, view.top, view.right, view.bottom)
    }

    private fun sendEvent(view: AdView, eventName: String, params: WritableMap) {
        val reactContext = view.context as ThemedReactContext
        reactContext
            .getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(view.id, eventName, params)
    }
}
