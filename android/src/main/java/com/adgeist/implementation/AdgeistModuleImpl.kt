package com.adgeist.implementation

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.adgeistkit.AdgeistCore
import com.adgeistkit.FetchCreative
import com.adgeistkit.CreativeAnalytics
import com.adgeistkit.CreativeDataModel
import com.adgeistkit.BidResponseData
import com.adgeistkit.SeatBid
import com.adgeistkit.Bid
import com.adgeistkit.BidExtension


class AdgeistModuleImpl internal constructor(private val context: ReactApplicationContext) {

  private var adgeistInstance: AdgeistCore? = null
  private var getAd: FetchCreative? = null
  private var postCreativeAnalytic: CreativeAnalytics? = null

  fun initializeSdk(customDomain: String?, promise: Promise) {
    try {
      adgeistInstance = AdgeistCore.initialize(context.applicationContext, customDomain)
      getAd = adgeistInstance?.getCreative()
      postCreativeAnalytic = adgeistInstance?.postCreativeAnalytics()
      promise.resolve("SDK initialized with domain: ${customDomain ?: "default"}")
    } catch (e: Exception) {
      promise.reject("INIT_FAILED", "SDK initialization failed", e)
    }
  }

  fun fetchCreative(apiKey: String, origin: String, adSpaceId: String, publisherId: String, isTestEnvironment: Boolean, promise: Promise) {
    getAd?.fetchCreative(apiKey, origin, adSpaceId, publisherId, isTestEnvironment) { adData ->
      if (adData != null) {
        promise.resolve(adData.toWritableMap())
      } else {
        promise.reject("NO_AD", "Ad data not available")
      }
    } ?: promise.reject("NOT_INITIALIZED", "SDK not initialized")
  }

  fun sendCreativeAnalytic(campaignId: String, adSpaceId: String, publisherId: String, eventType: String, origin: String, apiKey: String, bidId: String, isTestEnvironment: Boolean = true, promise: Promise) {
    postCreativeAnalytic?.sendTrackingData(campaignId, adSpaceId, publisherId, eventType, origin, apiKey, bidId, isTestEnvironment) { adData ->
      if (adData != null) {
        promise.resolve(adData)
      } else {
        promise.reject("NO_AD", "Couldn't find the campaign to update analytics")
      }
    } ?: promise.reject("NOT_INITIALIZED", "SDK not initialized")
  }

  companion object {
    const val NAME = "Adgeist"
  }
}

// Extension function to convert CreativeDataModel to WritableMap
fun CreativeDataModel.toWritableMap(): WritableMap {
    val map = Arguments.createMap()
    
    map.putBoolean("success", this.success)
    map.putString("message", this.message)
    
    // Handle null data - store in local variable for smart casting
    val dataValue = this.data
    if (dataValue != null) {
        val dataMap = Arguments.createMap()
        dataMap.putString("id", dataValue.id)
        dataMap.putString("bidId", dataValue.bidId)
        dataMap.putString("cur", dataValue.cur)
        
        // Handle null seatBid list - store in local variable
        val seatBidArray = Arguments.createArray()
        val seatBidList = dataValue.seatBid
        if (seatBidList != null) {
            for (seatBid in seatBidList) {
                val seatBidMap = Arguments.createMap()
                seatBidMap.putString("bidId", seatBid.bidId)
                
                // Handle null bid list - store in local variable
                val bidArray = Arguments.createArray()
                val bidList = seatBid.bid
                if (bidList != null) {
                    for (bid in bidList) {
                        val bidMap = Arguments.createMap()
                        bidMap.putString("id", bid.id)
                        bidMap.putString("impId", bid.impId)
                        bidMap.putDouble("price", bid.price)
                        
                        // Handle extension
                        val extMap = Arguments.createMap()
                        extMap.putString("creativeUrl", bid.ext.creativeUrl)
                        extMap.putString("ctaUrl", bid.ext.ctaUrl)
                        extMap.putString("creativeTitle", bid.ext.creativeTitle)
                        extMap.putString("creativeDescription", bid.ext.creativeDescription)
                        
                        bidMap.putMap("ext", extMap)
                        bidArray.pushMap(bidMap)
                    }
                }
                seatBidMap.putArray("bid", bidArray)
                seatBidArray.pushMap(seatBidMap)
            }
        }
        dataMap.putArray("seatBid", seatBidArray)
        map.putMap("data", dataMap)
    } else {
        map.putNull("data")
    }
    
    return map
}