package com.adgeist.components

import android.util.Log
import android.view.View
import androidx.annotation.RequiresPermission
import com.adgeistkit.ads.AdListener
import com.adgeistkit.ads.AdSize
import com.adgeistkit.ads.AdType
import com.adgeistkit.ads.AdView
import com.adgeistkit.request.AdRequest
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

    private val viewContextMap = mutableMapOf<Int, ThemedReactContext>()

    fun createViewInstance(reactContext: ThemedReactContext): AdView {
        Log.d(TAG, "Creating AdView with ThemedReactContext: ${reactContext.hashCode()}")
        val adView = AdView(reactContext)
        viewContextMap[System.identityHashCode(adView)] = reactContext
        Log.d(TAG, "AdView created with hash: ${System.identityHashCode(adView)} and context hash: ${reactContext.hashCode()}")
        return adView
    }

    fun setAdUnitID(view: AdView, adUnitID: String?) {
        if (adUnitID != null) {
            view.adUnitId = adUnitID
        }
    }

    fun setAdIsResponsive(view: AdView, adIsResponsive: Boolean) {
        view.adIsResponsive = adIsResponsive
    }

    fun setAdSize(view: AdView, adSizeMap: ReadableMap?) {
        if (adSizeMap != null) {
            try {
                val width = adSizeMap.getInt("width")
                val height = adSizeMap.getInt("height")

                val adSize = AdSize(width, height)

                view.setAdDimension(adSize)
            } catch (e: Exception) {
                Log.e(TAG, "Error setting ad size", e)
            }
        }
    }

    fun setAdType(view: AdView, adType: String?) {
        val typeToSet = adType ?: "BANNER"
        try {
            view.adType = AdType.valueOf(typeToSet)
        } catch (e: IllegalArgumentException) {
            Log.e(TAG, "Invalid ad type: $typeToSet. Must be BANNER, DISPLAY, or COMPANION", e)
            view.adType = AdType.BANNER
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
        try {
            view.destroy()
        } catch (e: Exception) {
            Log.e(TAG, "Error destroying ad view", e)
        } finally {
            // Clean up the context reference
            viewContextMap.remove(System.identityHashCode(view))
        }
    }

    private fun measureAndLayout(view: AdView) {
        view.measure(
            View.MeasureSpec.makeMeasureSpec(view.width, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(view.height, View.MeasureSpec.EXACTLY)
        )
        view.layout(view.left, view.top, view.right, view.bottom)
    }

    private fun sendEvent(view: AdView, eventName: String, params: WritableMap) {
        val reactContext = viewContextMap[System.identityHashCode(view)]
        if (reactContext != null) {
            try {
                reactContext
                    .getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(view.id, eventName, params)
            } catch (e: Exception) {
                Log.e(TAG, "Error sending event $eventName", e)
            }
        } else {
            Log.w(TAG, "Unable to send event $eventName: ThemedReactContext not found or view already destroyed")
        }
    }
}
