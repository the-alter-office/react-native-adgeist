package com.adgeist.components

import android.view.View
import android.widget.FrameLayout
import com.adgeistkit.embed.AdgeistEmbedder
import com.adgeistkit.embed.AdgeistEmbedderListener
import com.adgeistkit.utilities.AdgeistEmbedderApi
import com.facebook.react.uimanager.ThemedReactContext

@OptIn(AdgeistEmbedderApi::class)
class ReactAdView(val reactContext: ThemedReactContext) : FrameLayout(reactContext) {
  var adUnitID: String = ""
  var adIsResponsive: Boolean = false
  var reserveSpace: Boolean = true
  var listener: AdgeistEmbedderListener? = null

  private var widthDp = 0
  private var heightDp = 0
  private var adView: View? = null
  private var adConfig: AdConfig? = null

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

  fun setAdSize(widthDp: Int, heightDp: Int) {
    if (this.widthDp == widthDp && this.heightDp == heightDp) return
    this.widthDp = widthDp
    this.heightDp = heightDp
    if (adView != null) load()
  }

  fun load() {
    val config = AdConfig(adUnitID, widthDp, heightDp, adIsResponsive, reserveSpace)
    val view = adView?.takeIf { config == adConfig } ?: run {
      destroy()
      AdgeistEmbedder.createAdView(
        reactContext,
        config.adUnitID,
        config.widthDp,
        config.heightDp,
        config.responsive,
        config.reserveSpace,
        null,
        forwardingListener
      ).also {
        adView = it
        adConfig = config
        addView(it, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
      }
    }
    AdgeistEmbedder.load(view)
  }

  fun destroy() {
    val view = adView ?: return
    adView = null
    adConfig = null
    AdgeistEmbedder.destroy(view)
    removeView(view)
  }

  override fun requestLayout() {
    super.requestLayout()

    removeCallbacks(measureAndLayout)
    post(measureAndLayout)
  }

  private data class AdConfig(
    val adUnitID: String,
    val widthDp: Int,
    val heightDp: Int,
    val responsive: Boolean,
    val reserveSpace: Boolean
  )
}
