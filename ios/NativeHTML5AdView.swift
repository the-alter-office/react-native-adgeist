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
    @objc(onAdWarning:warning:) func onAdWarning(_ view: NativeHTML5AdView, warning: String)
    @objc(onAdSizeChanged:width:height:) func onAdSizeChanged(_ view: NativeHTML5AdView, width: Double, height: Double)
}

// MARK: - Main Swift View (Exposed to Objective-C++)
@objc(NativeHTML5AdView)
@objcMembers
public class NativeHTML5AdView: UIView {

    // MARK: Public Props (accessible from .mm)
    @objc public var adUnitID: String?
    @objc public var adSize: NSDictionary?
    @objc public var adIsResponsive: Bool = false
    @objc public var reserveSpace: Bool = true

    // MARK: Events (Old Architecture)
    @objc public var onAdLoaded: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdFailedToLoad: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdOpened: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdClosed: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdClicked: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdWarning: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdSizeChanged: ((_ body: [String: Any]) -> Void)?

    // MARK: Delegate (used to send events back to manager)
    @objc public weak var delegate: NativeHTML5AdDelegate?

    private var adView: AdView?

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
        adView?.frame = bounds
    }

    @objc public func triggerViewWillAppear() {}

    @objc public func reloadAd() {
        cleanupAdView()
        embedAdView()
        setNeedsLayout()
    }

    @objc public func loadAd() {
        reloadAd()
    }

    @objc public func destroy() {
        cleanupAdView()
    }

    private func cleanupAdView() {
        adView?.onEvent = nil
        adView?.removeFromSuperview()
        adView = nil
    }

    private func embedAdView() {
        guard let adUnitID = adUnitID, !adUnitID.isEmpty else {
            emitFailedToLoad("Ad unit ID is required")
            return
        }

        let dict = adSize as? [String: Any]
        let width = adIsResponsive ? nil : dimension(dict?["width"])
        let height = dimension(dict?["height"])

        let adView = AdView(adUnitId: adUnitID, width: width, height: height, reserveSpace: reserveSpace)
        adView.frame = bounds
        adView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        adView.onEvent = { [weak self, weak adView] event in
            DispatchQueue.main.async {
                guard let self = self, let adView = adView, adView === self.adView else { return }
                self.handle(event, from: adView)
            }
        }

        self.adView = adView
        addSubview(adView)
        adView.load()
    }

    private func handle(_ event: AdgeistEvent, from adView: AdView) {
        switch event.type {
        case .adLoaded:
            onAdLoaded?([:])
            delegate?.onAdLoaded(self)
            let size = adView.intrinsicContentSize
            if size.width > 0 && size.height > 0 {
                onAdSizeChanged?(["width": Double(size.width), "height": Double(size.height)])
                delegate?.onAdSizeChanged(self, width: Double(size.width), height: Double(size.height))
            }
        case .adClicked:
            onAdClicked?([:])
            delegate?.onAdClicked(self)
        case .adNoFill, .adNetworkError:
            emitFailedToLoad(event.message)
        case .adWarning:
            onAdWarning?(["warning": event.message])
            delegate?.onAdWarning(self, warning: event.message)
        }
    }

    private func emitFailedToLoad(_ message: String) {
        onAdFailedToLoad?(["error": message])
        delegate?.onAdFailedToLoad(self, error: message)
    }

    private func dimension(_ value: Any?) -> CGFloat? {
        guard let number = value as? NSNumber, number.doubleValue > 0 else { return nil }
        return CGFloat(number.doubleValue)
    }
}
