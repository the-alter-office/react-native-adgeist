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
    @objc public var reserveSpace: Bool = false

    // MARK: Events (Old Architecture)
    @objc public var onAdLoaded: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdFailedToLoad: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdOpened: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdClosed: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdClicked: ((_ body: [String: Any]) -> Void)?

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
        adView?.removeFromSuperview()
        adView = nil
    }

    private func resolvedAdSize() -> (width: CGFloat, height: CGFloat)? {
        if adIsResponsive { return nil }
        guard let dict = adSize as? [String: Any] else { return nil }

        guard let width = (dict["width"] as? NSNumber)?.doubleValue,
              let height = (dict["height"] as? NSNumber)?.doubleValue,
              width > 0, height > 0 else { return nil }

        return (CGFloat(width), CGFloat(height))
    }

    private func embedAdView() {
        guard let adUnitID = adUnitID, !adUnitID.isEmpty else {
            emitFailure("Ad unit ID is required")
            return
        }

        let size = resolvedAdSize()

        let adView = AdView(
            adUnitId: adUnitID,
            width: size?.width,
            height: size?.height,
            reserveSpace: reserveSpace && size != nil
        )
        adView.translatesAutoresizingMaskIntoConstraints = false
        addSubview(adView)

        NSLayoutConstraint.activate([
            adView.topAnchor.constraint(equalTo: topAnchor),
            adView.centerXAnchor.constraint(equalTo: centerXAnchor),
        ])

        self.adView = adView
        adView.load()
    }

    private func emitFailure(_ message: String) {
        if let onAdFailedToLoad = onAdFailedToLoad {
            let body = ["error": message]
            if Thread.isMainThread {
                onAdFailedToLoad(body)
            } else {
                DispatchQueue.main.async {
                    onAdFailedToLoad(body)
                }
            }
        }
        delegate?.onAdFailedToLoad(self, error: message)
    }
}
