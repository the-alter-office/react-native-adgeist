package com.adgeist.components

import android.util.Log
import com.adgeist.utils.buildAdEvent
import com.adgeist.utils.buildAdSizeEvent
import com.adgeist.utils.sendViewEvent
import com.adgeistkit.embed.AdgeistEmbedderListener
import com.adgeistkit.utilities.AdgeistEmbedderApi
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext

@OptIn(AdgeistEmbedderApi::class)
object AdPreviewViewManagerImpl {
    const val NAME = "AdPreviewNativeComponent"
    private const val TAG = "AdPreviewViewManagerImpl"

    const val AD_EVENT_LISTENER = "onAdEvent"
    const val AD_SIZE_CHANGED_LISTENER = "onAdSizeChanged"

    fun createViewInstance(reactContext: ThemedReactContext): ReactAdPreviewView {
        val view = ReactAdPreviewView(reactContext)
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

    fun setPreviewType(view: ReactAdPreviewView, type: String?) {
        view.setOption("type", type)
    }

    fun setPreviewMedia(view: ReactAdPreviewView, media: String?) {
        view.setOption("media", media)
    }

    fun setCreativeUrl(view: ReactAdPreviewView, creativeUrl: String?) {
        view.setOption("creativeUrl", creativeUrl)
    }

    fun setCompanionUrl(view: ReactAdPreviewView, companionUrl: String?) {
        view.setOption("companionUrl", companionUrl)
    }

    fun setTitle(view: ReactAdPreviewView, title: String?) {
        view.setOption("title", title)
    }

    fun setDescription(view: ReactAdPreviewView, description: String?) {
        view.setOption("description", description)
    }

    fun setCtaUrl(view: ReactAdPreviewView, ctaUrl: String?) {
        view.setOption("ctaUrl", ctaUrl)
    }

    fun setDeepLinkUrl(view: ReactAdPreviewView, deepLinkUrl: String?) {
        view.setOption("deepLinkUrl", deepLinkUrl)
    }

    fun setIsResponsive(view: ReactAdPreviewView, isResponsive: Boolean) {
        view.setOption("isResponsive", isResponsive)
    }

    fun setAdSize(view: ReactAdPreviewView, adSizeMap: ReadableMap?) {
        if (adSizeMap == null) return

        try {
            view.setOption("width", adSizeMap.getDimension("width"))
            view.setOption("height", adSizeMap.getDimension("height"))
        } catch (e: Exception) {
            Log.e(TAG, "Error setting preview size", e)
        }
    }

    fun setReserveSpace(view: ReactAdPreviewView, reserveSpace: Boolean) {
    }

    fun loadAd(view: ReactAdPreviewView) {
        try {
            view.load()
        } catch (e: Exception) {
            Log.e(TAG, "Error loading preview", e)
        }
    }

    fun destroyAd(view: ReactAdPreviewView) {
        try {
            view.destroy()
        } catch (e: Exception) {
            Log.e(TAG, "Error destroying preview view", e)
        }
    }

    fun dropViewInstance(view: ReactAdPreviewView) {
        view.listener = null
        destroyAd(view)
    }

    private fun ReadableMap.getDimension(key: String): Int =
        if (hasKey(key) && !isNull(key)) getDouble(key).toInt() else 0
}
