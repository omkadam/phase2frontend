// src/components/Wheel.js
import React, { useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";

const wheelData = [
  { label: "Happy", color: "#2b725e", image: "/Asset91.svg" },
  { label: "Sad", color: "#ffe164", image: "/anjuf.svg" },
  { label: "Surprised", color: "#ff9852", image: "/manjuf.svg" },
  { label: "Angry", color: "#ef5d59", image: "/sherf.svg" },
  { label: "Trust", color: "#a03737", image: "/robertf.svg" },
  { label: "Excited", color: "#6d3e50", image: "/rajuf.svg" },
  { label: "Disgust", color: "#2b2b2b", image: "/rehmanf.svg" },
  { label: "Afraid", color: "#26c493", image: "/julief.svg" },
];

const Wheel = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const wheelRef = useRef(null);

  const handleSelect = async (label, index) => {
    // Set the selected segment for animation
    setSelectedSegment(index);
    // Wait a bit for the animation to show
    setTimeout(async () => {
      await fetch(`http://localhost:3001/api/feeling/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeling: label }),
      });
      navigate("/learn");
    }, 600); // 600ms delay to show the pop effect
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => setRotation((r) => r - 45),
    onSwipedRight: () => setRotation((r) => r + 45),
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
  });

  const segmentAngle = 360 / wheelData.length; // 45 degrees per segment

  // Calculate which segment is at the top (pointed by needle)
  // The wheel rotates clockwise, and segments are arranged starting from top
  // We need to reverse the calculation since rotating right moves segments left
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  // Since we rotate the wheel, we need to find which original segment is now at the top
  // The first segment (index 0) is at the top when rotation = 0
  const topIndex =
    (wheelData.length - Math.round(normalizedRotation / segmentAngle)) %
    wheelData.length;
  const topLabel = wheelData[topIndex]?.label;

  return (
    <div
      {...handlers}
      className="min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden px-4"
    >
      <h1 className="text-2xl font-bold mb-6 text-black text-center">
        FEELINGS JOURNAL
      </h1>
      <h1 className="text-xl font-bold mb-6 text-black text-center">
        Swipe to rotate the wheel and tap how you are feeling right now.
      </h1>
      <div className="mt-0 mb-6 text-center">
        
        <p className="text-3xl font-bold text-black uppercase tracking-wide">
          {topLabel}
        </p>
      </div>

      <div className="relative w-80 h-80 md:w-96 md:h-96">
        {/* SVG wheel with segments */}
        <svg
          ref={wheelRef}
          className="absolute top-0 left-0 w-full h-full drop-shadow-2xl"
          viewBox="0 0 320 320"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: "transform 0.4s ease",
          }}
        >
          {wheelData.map((item, index) => {
            // Start the first segment at the top (0 degrees) and center it
            const startAngle = index * segmentAngle - 90 - segmentAngle / 2;
            const endAngle = (index + 1) * segmentAngle - 90 - segmentAngle / 2;
            const centerX = 160;
            const centerY = 160;
            const radius = 160;

            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);

            const largeArcFlag = segmentAngle > 180 ? 1 : 0;

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              "Z",
            ].join(" ");

            // Position text/image at the center of each segment
            const textAngle = index * segmentAngle - 90;
            const textAngleRad = (textAngle * Math.PI) / 180;
            const textRadius = radius * 0.7;
            const textX = centerX + textRadius * Math.cos(textAngleRad);
            const textY = centerY + textRadius * Math.sin(textAngleRad);

            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={item.color}
                  className="cursor-pointer hover:opacity-80 transition-all duration-300"
                  onClick={() => handleSelect(item.label, index)}
                  transform={
                    selectedSegment === index
                      ? `translate(${15 * Math.cos(textAngleRad)}, ${
                          15 * Math.sin(textAngleRad)
                        }) scale(1.1)`
                      : "translate(0, 0) scale(1)"
                  }
                  style={{
                    pointerEvents: "all",
                    transformOrigin: `${centerX}px ${centerY}px`,
                    transition: "transform 0.3s ease-out",
                  }}
                />
                <g
                  transform={`translate(${textX}, ${textY}) rotate(${-rotation}) ${
                    selectedSegment === index
                      ? `translate(${15 * Math.cos(textAngleRad)}, ${
                          15 * Math.sin(textAngleRad)
                        }) scale(1.1)`
                      : ""
                  }`}
                  className="pointer-events-none"
                  style={{
                    transition: "transform 0.3s ease-out",
                  }}
                >
                  <foreignObject
                    x="-35"
                    y="-35"
                    width="68"
                    height="69"
                    className="pointer-events-none"
                  >
                    <img
                      src={item.image}
                      alt={item.label}
                      className="w-16 h-16 mx-auto"
                    />
                  </foreignObject>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Center circle with needle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg border-4 border-gray-200 flex items-center justify-center relative z-20">
          {/* Needle pointing straight up */}
          <div className="absolute top-0 left-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[24px] border-transparent border-b-white transform -translate-x-1/2 -translate-y-full" />
          <div className="w-3 h-3 bg-gray-400 rounded-full z-10"></div>
        </div>
      </div>

      {/* Display the label of the segment the needle is pointing to */}
      {/* <div className="mt-6 text-center">
        <p className="text-sm text-black mb-1">Currently pointing to:</p>
        <p className="text-3xl font-bold text-black uppercase tracking-wide">
          {topLabel}
        </p>
      </div> */}
    </div>
  );
};

export default Wheel;
