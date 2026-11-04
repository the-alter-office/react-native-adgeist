import UIKit
import AdgeistKit
import React

// MARK: - Delegate Protocol (Objective-C compatible)
@objc public protocol NativeHTML5AdDelegate: NSObjectProtocol {
    @objc(onAdEvent:code:type:message:reason:) func onAdEvent(_ view: NativeHTML5AdView, code: String, type: String, message: String, reason: String?)
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
    @objc public var onAdEvent: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdSizeChanged: ((_ body: [String: Any]) -> Void)?

    // MARK: Delegate (used to send events back to manager)
    @objc public weak var delegate: NativeHTML5AdDelegate?

    private var adView: UIView?
    private var adConfig: AdConfig?

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
        guard adView != nil else { return }
        loadAd()
    }

    @objc public func loadAd() {
        let config = currentConfig()
        if adView == nil || config != adConfig {
            cleanupAdView()
            embedAdView(config)
        }
        if let adView = adView {
            AdgeistEmbedder.shared.load(adView)
        }
    }

    @objc public func destroy() {
        cleanupAdView()
    }

    private func cleanupAdView() {
        guard let adView = adView else { return }
        self.adView = nil
        adConfig = nil
        AdgeistEmbedder.shared.destroy(adView)
    }

    private func currentConfig() -> AdConfig {
        let dict = adSize as? [String: Any]
        return AdConfig(
            adUnitID: adUnitID ?? "",
            width: dimension(dict?["width"]),
            height: dimension(dict?["height"]),
            responsive: adIsResponsive,
            reserveSpace: reserveSpace
        )
    }

    private func embedAdView(_ config: AdConfig) {
        let adView = AdgeistEmbedder.shared.makeAdView(
            adSpaceId: config.adUnitID,
            width: config.width,
            height: config.height,
            responsive: config.responsive,
            reserveSpace: config.reserveSpace,
            onEvent: { [weak self] event in
                self?.emitAdEvent(event)
            },
            onSizeResolved: { [weak self] size in
                self?.emitAdSize(size)
            }
        )
        adView.frame = bounds
        adView.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        self.adView = adView
        adConfig = config
        addSubview(adView)
    }

    private func emitAdEvent(_ event: [String: Any]) {
        let code = event["code"] as? String ?? ""
        let type = event["type"] as? String ?? ""
        let message = event["message"] as? String ?? ""
        let reason = (event["data"] as? [String: Any])?["reason"] as? String
        let body: [String: Any] = [
            "code": code,
            "type": type,
            "message": message,
            "data": ["reason": reason ?? ""]
        ]

        onAdEvent?(body)
        delegate?.onAdEvent(self, code: code, type: type, message: message, reason: reason)
    }

    private func emitAdSize(_ size: CGSize) {
        onAdSizeChanged?(["width": Double(size.width), "height": Double(size.height)])
        delegate?.onAdSizeChanged(self, width: Double(size.width), height: Double(size.height))
    }

    private func dimension(_ value: Any?) -> CGFloat {
        guard let number = value as? NSNumber, number.doubleValue > 0 else { return 0 }
        return CGFloat(number.doubleValue)
    }
}

private struct AdConfig: Equatable {
    let adUnitID: String
    let width: CGFloat
    let height: CGFloat
    let responsive: Bool
    let reserveSpace: Bool
}
