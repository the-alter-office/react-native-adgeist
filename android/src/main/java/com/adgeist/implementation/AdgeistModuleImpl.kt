package com.adgeist.implementation

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.adgeistkit.AdgeistCore
import com.adgeistkit.CreativeDataModel
import com.adgeistkit.BidResponseData
import com.adgeistkit.SeatBid
import com.adgeistkit.Bid
import com.adgeistkit.BidExtension


class AdgeistModuleImpl internal constructor(private val context: ReactApplicationContext) {

  private val adgeistInstanceFromLibrary = AdgeistCore.initialize(context.applicationContext)
  private val getAd = adgeistInstanceFromLibrary.getCreative()
  private val postCreativeAnalytic = adgeistInstanceFromLibrary.postCreativeAnalytics()

  fun fetchCreative(apiKey: String, origin: String, adSpaceId: String, publisherId: String, isTestEnvironment: Boolean, promise: Promise) {
    getAd.fetchCreative(apiKey, origin, adSpaceId, publisherId, isTestEnvironment) { adData ->
      if (adData != null) {
        promise.resolve(adData.toWritableMap())
      } else {
        promise.reject("NO_AD", "Ad data not available")
      }
    }
  }

  fun sendCreativeAnalytic(campaignId: String, adSpaceId: String, publisherId: String, eventType: String, origin: String, apiKey: String, bidId: String, isTestEnvironment: Boolean = true, promise: Promise) {
    postCreativeAnalytic.sendTrackingData(campaignId, adSpaceId, publisherId, eventType, origin, apiKey, bidId, isTestEnvironment) { adData ->
      if (adData != null) {
        promise.resolve(adData)
      } else {
        promise.reject("NO_AD", "Couldn't find the campaign to update analytics")
      }
    }
  }

  companion object {
    const val NAME = "Adgeist"

  }
}

// Extension function to convert CreativeDataModel to WritableMap
fun CreativeDataModel.toWritableMap(): WritableMap {
  val map = Arguments.createMap()
  map.putBoolean("success", success)
  map.putString("message", message)

  val dataMap = Arguments.createMap()
  data?.let { bidResponse ->
    dataMap.putString("id", bidResponse.id)
    dataMap.putString("bidId", bidResponse.bidId)
    dataMap.putString("cur", bidResponse.cur)

    val seatBidArray = Arguments.createArray()
    bidResponse.seatBid.forEach { seatBid ->
      val seatBidMap = Arguments.createMap()
      seatBidMap.putString("bidId", seatBid.bidId)

      val bidArray = Arguments.createArray()
      seatBid.bid.forEach { bid ->
        val bidMap = Arguments.createMap()
        bidMap.putString("id", bid.id)
        bidMap.putString("impId", bid.impId)
        bidMap.putDouble("price", bid.price)

        val extMap = Arguments.createMap()
        extMap.putString("creativeUrl", bid.ext.creativeUrl)
        extMap.putString("ctaUrl", bid.ext.ctaUrl)
        extMap.putString("creativeTitle", bid.ext.creativeTitle)
        extMap.putString("creativeDescription", bid.ext.creativeDescription)
        bidMap.putMap("ext", extMap)

        bidArray.pushMap(bidMap)
      }
      seatBidMap.putArray("bid", bidArray)
      seatBidArray.pushMap(seatBidMap)
    }
    dataMap.putArray("seatBid", seatBidArray)
  }

  map.putMap("data", dataMap)
  return map
}
