import Cropper from "react-easy-crop";
import { useState } from "react";

const ImageCropModal = ({ image, onCancel, onDone }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          width: "90%",
          maxWidth: 500,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* Crop area */}
        <div style={{ position: "relative", width: "100%", height: 300 }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={2}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, area) => setCroppedArea(area)}
          />
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 12,
          }}
        >
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onDone(croppedArea)}
          >
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
