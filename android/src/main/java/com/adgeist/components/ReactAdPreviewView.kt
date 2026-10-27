package com.adgeist.components

import android.content.Context
import android.widget.FrameLayout
import com.adgeistkit.ads.AdPreviewMedia
import com.adgeistkit.ads.AdSize
import com.adgeistkit.ads.AdViewPreview
import com.adgeistkit.data.models.AdSpaceType

class ReactAdPreviewView(context: Context) : FrameLayout(context) {

    var previewType: AdSpaceType = AdSpaceType.BANNER
        set(value) {
            if (field == value) return
            field = value
            schedulePropsReload()
        }

    var previewMedia: AdPreviewMedia = AdPreviewMedia.IMAGE
        set(value) {
            if (field == value) return
            field = value
            schedulePropsReload()
        }

    var creativeUrl: String? = null
        set(value) {
            if (field == value) return
            field = value
            schedulePropsReload()
        }

    var companionUrl: String? = null
        set(value) {
            if (field == value) return
            field = value
            schedulePropsReload()
        }

    var adTitle: String = ""
        set(value) {
            if (field == value) return
            field = value
            schedulePropsReload()
        }

    var adDescription: String = ""
        set(value) {
            if (field == value) return
            field = value
            schedulePropsReload()
        }

    var ctaUrl: String = DEFAULT_CTA_URL
        set(value) {
            if (field == value) return
            field = value
            schedulePropsReload()
        }

    var deepLinkUrl: String? = null
        set(value) {
            if (field == value) return
            field = value
            schedulePropsReload()
        }

    var adIsResponsive: Boolean = true
        set(value) {
            if (field == value) return
            field = value
            schedulePropsReload()
        }

    var adSize: AdSize? = null
        set(value) {
            if (field == value) return
            field = value
            schedulePropsReload()
        }

    private var preview: AdViewPreview? = null
    private var hasLoaded = false

    private val measureAndLayout = Runnable {
        measure(
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
        )
        layout(left, top, right, bottom)
    }

    private val reload = Runnable {
        if (hasLoaded) embedPreview()
    }

    fun load() {
        hasLoaded = true
        removeCallbacks(reload)
        embedPreview()
    }

    fun destroy() {
        hasLoaded = false
        removeCallbacks(reload)
        cleanup()
    }

    override fun requestLayout() {
        super.requestLayout()

        removeCallbacks(measureAndLayout)
        post(measureAndLayout)
    }

    private fun schedulePropsReload() {
        if (!hasLoaded) return

        removeCallbacks(reload)
        post(reload)
    }

    private fun cleanup() {
        preview?.destroy()
        preview = null
        removeAllViews()
    }

    private fun embedPreview() {
        cleanup()

        val view = AdViewPreview(context)
        view.adSpaceType = previewType
        view.media = previewMedia
        view.creativeUrl = creativeUrl
        view.companionUrl = companionUrl
        view.title = adTitle
        view.description = adDescription
        view.ctaUrl = ctaUrl
        view.deepLinkUrl = deepLinkUrl
        view.adIsResponsive = adIsResponsive
        view.adSize = adSize

        preview = view
        addView(view, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
        view.load()
    }

    companion object {
        const val DEFAULT_CTA_URL = "https://adgeist.ai"
    }
}
