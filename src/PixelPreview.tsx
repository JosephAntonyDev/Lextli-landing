import "./pixel-preview.css";

type PixelPreviewProps = {
  src: string;
  alt: string;
};

/** Blender-rendered hardware with a live, uncropped screenshot layer. */
export function PixelPreview({ src, alt }: PixelPreviewProps) {
  return (
    <div className="pixel-preview">
      <img
        className="pixel-preview__back"
        src="/device/pixel-back.webp"
        alt=""
        width="840"
        height="1760"
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />
      <div className="pixel-preview__front">
        <img
          className="pixel-preview__hardware"
          src="/device/pixel-front.webp"
          alt=""
          width="840"
          height="1760"
          loading="lazy"
          decoding="async"
          aria-hidden="true"
        />
        <div className="pixel-preview__display">
          <div className="pixel-preview__camera" aria-hidden="true" />
          <img
            className="pixel-preview__screen"
            key={src}
            src={src}
            alt={alt}
            width="780"
            height="1688"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}
