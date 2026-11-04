package com.adgeist.components

import android.util.Log
import com.adgeist.utils.WrapperEventCode
import com.adgeist.utils.buildAdEvent
import com.adgeist.utils.buildAdSizeEvent
import com.adgeist.utils.sendViewEvent
import com.adgeistkit.embed.AdgeistEmbedderListener
import com.adgeistkit.utilities.AdgeistEmbedderApi
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext

@OptIn(AdgeistEmbedderApi::class)
object HTML5AdViewManagerImpl {
    const val NAME = "HTML5AdNativeComponent"
    private const val TAG = "HTML5AdViewManagerImpl"

    const val AD_EVENT_LISTENER = "onAdEvent"
    const val AD_SIZE_CHANGED_LISTENER = "onAdSizeChanged"

    fun createViewInstance(reactContext: ThemedReactContext): ReactAdView {
        val view = ReactAdView(reactContext)
        view.listener = object : AdgeistEmbedderListener {
            override fun onEvent(event: Map<String, Any?>) {
                reactContext.sendViewEvent(view, AD_EVENT_LISTENER, buildAdEvent(event))
            }

            override fun onSizeResolved(widthDp: Int, heightDp: Int) {
                reactContext.sendViewEvent(view, AD_SIZE_CHANGED_LISTENER, buildAdSizeEvent(widthDp, heightDp))
            }
        }
        return view
    }

    fun setAdUnitID(view: ReactAdView, adUnitID: String?) {
        if (adUnitID != null) {
            view.adUnitID = adUnitID
        }
    }

    fun setAdIsResponsive(view: ReactAdView, adIsResponsive: Boolean) {
        view.adIsResponsive = adIsResponsive
    }

    fun setAdSize(view: ReactAdView, adSizeMap: ReadableMap?) {
        if (adSizeMap == null) return

        try {
            view.setAdSize(adSizeMap.getDimension("width"), adSizeMap.getDimension("height"))
        } catch (e: Exception) {
            Log.e(TAG, "Error setting ad size", e)
        }
    }

    fun setReserveSpace(view: ReactAdView, reserveSpace: Boolean) {
        view.reserveSpace = reserveSpace
    }

    fun loadAd(view: ReactAdView) {
        try {
            view.load()
        } catch (e: Exception) {
            val payload = buildAdEvent(
                WrapperEventCode.RWAE1,
                reason = listOfNotNull(e::class.java.simpleName, e.message).joinToString(": ")
            )
            view.reactContext.sendViewEvent(view, AD_EVENT_LISTENER, payload)
        }
    }

    fun destroyAd(view: ReactAdView) {
        try {
            view.destroy()
        } catch (e: Exception) {
            Log.e(TAG, "Error destroying ad view", e)
        }
    }

    fun dropViewInstance(view: ReactAdView) {
        view.listener = null
        destroyAd(view)
    }

    private fun ReadableMap.getDimension(key: String): Int =
        if (hasKey(key) && !isNull(key)) getDouble(key).toInt() else 0
}
