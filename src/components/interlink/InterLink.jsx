import React, { useState, useRef, useEffect } from "react";
import "./interlink.css";
import { BigHead } from "@bigheads/core";
import { useUserStore } from "../../lib/userStore";
import { useChatStore } from "../../lib/chatStore";

export default function InterLink() {
  const {currentUser,toggleMap,interLink} = useUserStore()
  const { user } = useChatStore();

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // --- CLAMP FUNCTION (no empty spaces) ---
  const clampTranslate = (t, s, rect, img) => {
  const imgWidth = img.naturalWidth * s;
  const imgHeight = img.naturalHeight * s;

  let minX = Math.min(rect.width - imgWidth, 0);
  let minY = Math.min(rect.height - imgHeight, 0);

  let maxX = Math.max(rect.width - imgWidth, 0);
  let maxY = Math.max(rect.height - imgHeight, 0);

  // if image is smaller than container → center it
  if (imgWidth < rect.width) {
    t.x = (rect.width - imgWidth) / 2;
  } else {
    t.x = Math.max(minX, Math.min(t.x, 0));
  }

  if (imgHeight < rect.height) {
    t.y = (rect.height - imgHeight) / 2;
  } else {
    t.y = Math.max(minY, Math.min(t.y, 0));
  }

  return t;
};


  // --- INITIAL CENTERING ---
  useEffect(() => {
  if (containerRef.current && imgRef.current) {
    const rect = containerRef.current.getBoundingClientRect();
    const img = imgRef.current;

    const scaleX = rect.width / img.naturalWidth;
    const scaleY = rect.height / img.naturalHeight;
    const initialScale = Math.min(scaleX, scaleY); // scale to fit container

    const initialTranslate = {
      x: (rect.width - img.naturalWidth * initialScale) / 1,
      y: (rect.height - img.naturalHeight * initialScale) / 1,
    };

    setScale(initialScale);
    setTranslate(initialTranslate);
  }
}, []);

  // --- ZOOM HANDLER ---
  const handleWheel = (e) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const img = imgRef.current;

    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const zoomIntensity = 1;
    const newScale = e.deltaY < 0 ? scale + zoomIntensity : scale - zoomIntensity;
    const clampedScale = Math.min(Math.max(newScale, 1), 5);

    const dx = offsetX - translate.x;
    const dy = offsetY - translate.y;
    const ratio = clampedScale / scale;

    let newTranslate = {
      x: offsetX - dx * ratio,
      y: offsetY - dy * ratio,
    };

    newTranslate = clampTranslate(newTranslate, clampedScale, rect, img);

    setTranslate(newTranslate);
    setScale(clampedScale);
  };

  // --- DRAG HANDLERS ---
  const handleMouseDown = (e) => {
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;

    const rect = containerRef.current.getBoundingClientRect();
    const img = imgRef.current;
    let newTranslate = { x: translate.x + dx, y: translate.y + dy };

    newTranslate = clampTranslate(newTranslate, scale, rect, img);

    setTranslate(newTranslate);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="chat">
      {/* Top Section */}
      <div className="top">
        <div className="user">
          <div className="avatarWrapper" title="User Avatar">
            {user?.avatar ? <BigHead {...user.avatar} /> : <img src="/avatar.png" alt="User Avatar" />}
          </div>
          <div className="texts">
            <h1>{user?.username || "Unknown User"}</h1>
            <p>BaseBall huh?</p>
          </div>
        </div>
        <div className="icons">
          <img src="/phone.png" alt="Phone" />
          <img src="/video.png" alt="Video Call" />
          <img src="/info.png" alt="Info" />
          <img src="./linked.png" alt="Switch to Map" onClick={toggleMap} className="cursor-pointer w-8 h-8"/>
        </div>
      </div>

      {/* Divider */}
      <hr className="divider" />

      {/* Map Section */}
      <div
        className="map-section"
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          ref={imgRef}
          src="/map.png"
          alt="Map"
          className="map-image"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "top left",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        />
      </div>
    </div>
  );
}
