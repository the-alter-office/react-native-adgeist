package com.adgeist.components

import android.util.Log
import com.adgeistkit.ads.AdPreviewMedia
import com.adgeistkit.ads.AdSize
import com.adgeistkit.data.models.AdSpaceType
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext

object AdPreviewViewManagerImpl {
    const val NAME = "AdPreviewNativeComponent"
    private const val TAG = "AdPreviewViewManagerImpl"

    const val AD_EVENT_LISTENER = "onAdEvent"
    const val AD_SIZE_CHANGED_LISTENER = "onAdSizeChanged"

    fun createViewInstance(reactContext: ThemedReactContext): ReactAdPreviewView =
        ReactAdPreviewView(reactContext)

    fun setPreviewType(view: ReactAdPreviewView, type: String?) {
        view.previewType = when (type?.lowercase()) {
            "display" -> AdSpaceType.DISPLAY
            "companion" -> AdSpaceType.COMPANION
            else -> AdSpaceType.BANNER
        }
    }

    fun setPreviewMedia(view: ReactAdPreviewView, media: String?) {
        view.previewMedia = when (media?.lowercase()) {
            "gif" -> AdPreviewMedia.GIF
            "video" -> AdPreviewMedia.VIDEO
            else -> AdPreviewMedia.IMAGE
        }
    }

    fun setCreativeUrl(view: ReactAdPreviewView, creativeUrl: String?) {
        view.creativeUrl = creativeUrl?.takeIf { it.isNotBlank() }
    }

    fun setCompanionUrl(view: ReactAdPreviewView, companionUrl: String?) {
        view.companionUrl = companionUrl?.takeIf { it.isNotBlank() }
    }

    fun setTitle(view: ReactAdPreviewView, title: String?) {
        view.adTitle = title.orEmpty()
    }

    fun setDescription(view: ReactAdPreviewView, description: String?) {
        view.adDescription = description.orEmpty()
    }

    fun setCtaUrl(view: ReactAdPreviewView, ctaUrl: String?) {
        view.ctaUrl = ctaUrl?.takeIf { it.isNotBlank() } ?: ReactAdPreviewView.DEFAULT_CTA_URL
    }

    fun setDeepLinkUrl(view: ReactAdPreviewView, deepLinkUrl: String?) {
        view.deepLinkUrl = deepLinkUrl?.takeIf { it.isNotBlank() }
    }

    fun setIsResponsive(view: ReactAdPreviewView, isResponsive: Boolean) {
        view.adIsResponsive = isResponsive
    }

    fun setAdSize(view: ReactAdPreviewView, adSizeMap: ReadableMap?) {
        if (adSizeMap == null) return

        try {
            val width = adSizeMap.getDimension("width")
            val height = adSizeMap.getDimension("height")

            view.adSize = when {
                width > 0 && height > 0 -> AdSize(width, height)
                width > 0 -> AdSize.width(width)
                height > 0 -> AdSize.height(height)
                else -> null
            }
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

    private fun ReadableMap.getDimension(key: String): Int =
        if (hasKey(key) && !isNull(key)) getDouble(key).toInt() else 0
}
