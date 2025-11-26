package com.adgeist.adview

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

object AdViewManagerImpl {
    const val NAME = "RNAdgeistAdView"
    private const val TAG = "AdViewManagerImpl"

    const val EVENT_AD_LOADED = "onAdLoaded"
    const val EVENT_AD_FAILED_TO_LOAD = "onAdFailedToLoad"
    const val EVENT_AD_OPENED = "onAdOpened"
    const val EVENT_AD_CLOSED = "onAdClosed"
    const val EVENT_AD_CLICKED = "onAdClicked"

    fun createViewInstance(reactContext: ThemedReactContext): AdView {
        return AdView(reactContext)
    }

    fun setAdUnitId(view: AdView, adUnitId: String?) {
        if (adUnitId != null) {
            view.adUnitId = adUnitId
        }
    }

    fun setAdSize(view: AdView, adSizeMap: ReadableMap?) {
        if (adSizeMap != null) {
            try {
                val width = if (adSizeMap.hasKey("width")) adSizeMap.getInt("width") else 320
                val height = if (adSizeMap.hasKey("height")) adSizeMap.getInt("height") else 50

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

    @RequiresPermission("android.permission.INTERNET")
    fun loadAd(view: AdView, adRequestMap: ReadableMap?) {
        try {
            val adRequestBuilder = AdRequest.Builder()

            if (adRequestMap != null) {
                if (adRequestMap.hasKey("isTestMode")) {
                    adRequestBuilder.setTestMode(adRequestMap.getBoolean("isTestMode"))
                }
            }

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

    private fun measureAndLayout(view: AdView) {
        view.measure(
            View.MeasureSpec.makeMeasureSpec(view.measuredWidth, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(view.measuredHeight, View.MeasureSpec.EXACTLY)
        )
        view.layout(view.left, view.top, view.right, view.bottom)
    }

    fun destroyAd(view: AdView) {
    }

    private fun sendEvent(view: AdView, eventName: String, params: WritableMap) {
        val reactContext = view.context as ThemedReactContext
        reactContext
            .getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(view.id, eventName, params)
    }
}
