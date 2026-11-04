package com.adgeist.components

import android.view.View
import android.widget.FrameLayout
import com.adgeistkit.embed.AdgeistEmbedder
import com.adgeistkit.embed.AdgeistEmbedderListener
import com.adgeistkit.utilities.AdgeistEmbedderApi
import com.facebook.react.uimanager.ThemedReactContext

@OptIn(AdgeistEmbedderApi::class)
class ReactAdPreviewView(val reactContext: ThemedReactContext) : FrameLayout(reactContext) {

    var listener: AdgeistEmbedderListener? = null

    private val options = HashMap<String, Any?>()
    private var preview: View? = null
    private var hasLoaded = false

    private val forwardingListener = object : AdgeistEmbedderListener {
        override fun onEvent(event: Map<String, Any?>) {
            listener?.onEvent(event)
        }

        override fun onSizeResolved(widthDp: Int, heightDp: Int) {
            listener?.onSizeResolved(widthDp, heightDp)
        }
    }

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

    fun setOption(key: String, value: Any?) {
        if (options.containsKey(key) && options[key] == value) return
        options[key] = value
        schedulePropsReload()
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
        val view = preview ?: return
        preview = null
        AdgeistEmbedder.destroy(view)
        removeView(view)
    }

    private fun embedPreview() {
        cleanup()

        val view = AdgeistEmbedder.createPreviewView(reactContext, HashMap(options), forwardingListener)
        preview = view
        addView(view, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
        AdgeistEmbedder.load(view)
    }
}
