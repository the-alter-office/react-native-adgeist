import UIKit
import AdgeistKit
import React

// MARK: - Delegate Protocol (Objective-C compatible)
@objc public protocol NativeHTML5AdDelegate: NSObjectProtocol {
    @objc func onAdLoaded(_ view: NativeHTML5AdView)
    @objc(onAdFailedToLoad:error:) func onAdFailedToLoad(_ view: NativeHTML5AdView, error: String)
    @objc func onAdOpened(_ view: NativeHTML5AdView)
    @objc func onAdClosed(_ view: NativeHTML5AdView)
    @objc func onAdClicked(_ view: NativeHTML5AdView)
}

// MARK: - Main Swift View (Exposed to Objective-C++)
@objc(NativeHTML5AdView)
@objcMembers
public class NativeHTML5AdView: UIView {
      
    // MARK: Public Props (accessible from .mm)
    @objc public var adUnitID: String?
    @objc public var adSize: NSDictionary?
    @objc public var adType: String?
    @objc public var adIsResponsive: Bool = false
    
    // MARK: Events (Old Architecture)
    @objc public var onAdLoaded: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdFailedToLoad: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdOpened: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdClosed: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdClicked: ((_ body: [String: Any]) -> Void)?

    // MARK: Delegate (used to send events back to manager)
    @objc public weak var delegate: NativeHTML5AdDelegate?

    // MARK: Private Ad View & Listener
    private var adView: AdView?
    private var adListener: NativeHTML5AdListener?
    private var isTestMode: Bool = false

    public override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = .clear
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
    }

    @objc public func triggerViewWillAppear() {
        // adView?.resume()
    }
    
    @objc public func reloadAd() {
        cleanupAdView()
        embedAdView()
        setNeedsLayout()
    }

    @objc public func loadAd(_ options: NSDictionary) {
        if let testMode = options["isTestMode"] as? Bool {
            self.isTestMode = testMode
        }
        reloadAd()
    }

    @objc public func destroy() {
        cleanupAdView()
    }
    
    private func cleanupAdView() {
        adView?.destroy()
        adView?.removeFromSuperview()
        adView = nil
        adListener = nil
    }

    private func embedAdView() {
        guard let adUnitID = adUnitID else {
            delegate?.onAdFailedToLoad(self, error: "Ad unit ID is required")
            return
        }

        let adView = AdView()
        adView.frame = bounds
        adView.adUnitId = adUnitID
        adView.adIsResposive = adIsResponsive

        if let dict = adSize as? [String: Any] {
            if let w = dict["width"] as? Int, let h = dict["height"] as? Int {
                adView.setAdDimension(AdSize(width: w, height: h))
            }
        }

        if let adType = adType { adView.adType = adType }

        let listener = NativeHTML5AdListener(view: self)
        self.adListener = listener
        adView.setAdListener(listener)

        self.adView = adView
        addSubview(adView)

        let request = AdRequest.AdRequestBuilder()
            .setTestMode(self.isTestMode)
            .build()
        adView.loadAd(request)
    }
}

// MARK: - Ad Listener (Bridge to delegate)
private class NativeHTML5AdListener: AdListener {
    private weak var view: NativeHTML5AdView?

    init(view: NativeHTML5AdView) {
        self.view = view
        super.init()
    }

    override func onAdLoaded() {
        if let view = view {
            // Old Architecture
            if let onAdLoaded = view.onAdLoaded {
                onAdLoaded([:])
            }
            // New Architecture (or if delegate is used)
            view.delegate?.onAdLoaded(view)
        }
    }

    override func onAdFailedToLoad(_ errorMessage: String) {
        if let view = view {
            // Old Architecture
            if let onAdFailedToLoad = view.onAdFailedToLoad {
                let errorDict = ["error": errorMessage]
                if Thread.isMainThread {
                    onAdFailedToLoad(errorDict)
                } else {
                    DispatchQueue.main.async {
                        onAdFailedToLoad(errorDict)
                    }
                }
            }
            // New Architecture (or if delegate is used)
            view.delegate?.onAdFailedToLoad(view, error: errorMessage)
        }
    }

    override func onAdClicked() {
        if let view = view {
            // Old Architecture
            if let onAdClicked = view.onAdClicked {
                onAdClicked([:])
            }
            // New Architecture (or if delegate is used)
            view.delegate?.onAdClicked(view)
        }
    }

    override func onAdImpression() {
        if let view = view {
            // Old Architecture (mapped to onAdOpened)
            if let onAdOpened = view.onAdOpened {
                onAdOpened([:])
            }
            // New Architecture (or if delegate is used)
            view.delegate?.onAdOpened(view)
        }
    }

    override func onAdClosed() {
        if let view = view {
            // Old Architecture
            if let onAdClosed = view.onAdClosed {
                onAdClosed([:])
            }
            // New Architecture (or if delegate is used)
            view.delegate?.onAdClosed(view)
        }
    }
}
