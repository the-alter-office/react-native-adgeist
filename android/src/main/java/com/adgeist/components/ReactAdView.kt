package com.adgeist.components

import android.content.Context
import com.adgeistkit.ads.AdView

class ReactAdView(context: Context) : AdView(context) {
  private val measureAndLayout = Runnable {
    measure(
      MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
    )
    layout(left, top, right, bottom)
  }

  override fun requestLayout() {
    super.requestLayout()

    removeCallbacks(measureAndLayout)
    post(measureAndLayout)
  }
}
