package com.adgeist.utils

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.adgeistkit.data.models.*

fun CPMAdResponse.toWritableMap(): WritableMap {
  val map = Arguments.createMap()

  map.putBoolean("success", success)
  map.putString("message", message)

  val dataMap = Arguments.createMap()
  val d = data

  if (d != null) {
    dataMap.putString("id", d.id)
    dataMap.putString("bidId", d.bidId)
    dataMap.putString("cur", d.cur)

    val seatBidArray = Arguments.createArray()
    d.seatBid.forEach { seatBid ->
      val seatMap = Arguments.createMap()
      seatMap.putString("bidId", seatBid.bidId)

      val bidArr = Arguments.createArray()
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
        bidArr.pushMap(bidMap)
      }
      seatMap.putArray("bid", bidArr)
      seatBidArray.pushMap(seatMap)
    }

    dataMap.putArray("seatBid", seatBidArray)
  }

  map.putMap("data", dataMap)
  return map
}

fun FixedAdResponse.toWritableMap(): WritableMap {
  val map = Arguments.createMap()

  isTest?.let { map.putBoolean("isTest", it) }
  expiresAt?.let { map.putString("expiresAt", it) }
  map.putString("metaData", metaData)
  map.putString("id", id)
  generatedAt?.let { map.putString("generatedAt", it) }
  signature?.let { map.putString("signature", it) }
  campaignId?.let { map.putString("campaignId", it) }
  type?.let { map.putString("type", it) }
  loadType?.let { map.putString("loadType", it) }
  frontendCacheDurationSeconds?.let { map.putInt("frontendCacheDurationSeconds", it) }

  advertiser?.let {
    val advMap = Arguments.createMap()
    advMap.putString("id", it.id)
    advMap.putString("name", it.name)
    advMap.putString("logoUrl", it.logoUrl)
    map.putMap("advertiser", advMap)
  }

  campaignValidity?.let {
    val cvMap = Arguments.createMap()
    cvMap.putString("startTime", it.startTime)
    cvMap.putString("endTime", it.endTime)
    map.putMap("campaignValidity", cvMap)
  }

  val creativesArr = Arguments.createArray()
  creatives.forEach { creative ->
    val cMap = Arguments.createMap()
    cMap.putString("ctaUrl", creative.ctaUrl)
    cMap.putString("description", creative.description)
    cMap.putString("fileName", creative.fileName)
    cMap.putInt("fileSize", creative.fileSize ?: 0)
    cMap.putString("fileUrl", creative.fileUrl)
    cMap.putString("thumbnailUrl", creative.thumbnailUrl)
    cMap.putString("title", creative.title)
    cMap.putString("type", creative.type)

    creative.contentModerationResult?.let {
      val cm = Arguments.createMap()
      cm.putString("\$oid", it.`$oid`)
      cMap.putMap("contentModerationResult", cm)
    }

    creative.createdAt?.let {
      val cm = Arguments.createMap()
      cm.putDouble("\$date", it.`$date`?.toDouble() ?: 0.0)
      cMap.putMap("createdAt", cm)
    }

    creative.updatedAt?.let {
      val cm = Arguments.createMap()
      cm.putDouble("\$date", it.`$date`?.toDouble() ?: 0.0)
      cMap.putMap("updatedAt", cm)
    }

    creativesArr.pushMap(cMap)
  }
  map.putArray("creatives", creativesArr)

  val creativesV1Arr = Arguments.createArray()
  creativesV1.forEach { creativeV1 ->
    val cv1Map = Arguments.createMap()
    cv1Map.putString("title", creativeV1.title)
    cv1Map.putString("description", creativeV1.description)
    cv1Map.putString("ctaUrl", creativeV1.ctaUrl)

    creativeV1.primary?.let {
      val primMap = Arguments.createMap()
      primMap.putString("type", it.type)
      primMap.putString("fileName", it.fileName)
      primMap.putInt("fileSize", it.fileSize ?: 0)
      primMap.putString("fileUrl", it.fileUrl)
      primMap.putString("thumbnailUrl", it.thumbnailUrl)
      cv1Map.putMap("primary", primMap)
    }

    creativeV1.companions?.let { companions ->
      val companionsArr = Arguments.createArray()
      companions.forEach { companion ->
        val compMap = Arguments.createMap()
        compMap.putString("type", companion.type)
        compMap.putString("fileName", companion.fileName)
        compMap.putInt("fileSize", companion.fileSize ?: 0)
        compMap.putString("fileUrl", companion.fileUrl)
        compMap.putString("thumbnailUrl", companion.thumbnailUrl)
        companionsArr.pushMap(compMap)
      }
      cv1Map.putArray("companions", companionsArr)
    }

    creativesV1Arr.pushMap(cv1Map)
  }
  map.putArray("creativesV1", creativesV1Arr)

  displayOptions?.let { opt ->
    val opMap = Arguments.createMap()
    opMap.putBoolean("isResponsive", opt.isResponsive ?: false)
    opMap.putString("responsiveType", opt.responsiveType)

    opt.dimensions?.let {
      val dim = Arguments.createMap()
      dim.putInt("height", it.height ?: 0)
      dim.putInt("width", it.width ?: 0)
      opMap.putMap("dimensions", dim)
    }

    opt.styleOptions?.let {
      val st = Arguments.createMap()
      st.putString("fontColor", it.fontColor)
      st.putString("fontFamily", it.fontFamily)
      opMap.putMap("styleOptions", st)
    }

    opt.allowedFormats?.let { list ->
      val arr = Arguments.createArray()
      list.forEach { arr.pushString(it) }
      opMap.putArray("allowedFormats", arr)
    }

    map.putMap("displayOptions", opMap)
  }

  impressionRequirements?.let {
    val ir = Arguments.createMap()
    it.impressionType?.let { types ->
      val typesArr = Arguments.createArray()
      types.forEach { type -> typesArr.pushString(type) }
      ir.putArray("impressionType", typesArr)
    }
    ir.putInt("minViewDurationSeconds", it.minViewDurationSeconds ?: 0)
    map.putMap("impressionRequirements", ir)
  }

  return map
}
