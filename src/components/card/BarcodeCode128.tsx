"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
}

export default function BarcodeCode128({
  value,
  width = 1.2,
  height = 28,
  displayValue = true,
  fontSize = 9,
}: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width,
          height,
          displayValue,
          fontSize,
          margin: 0,
          background: "transparent",
          lineColor: "#0f172a",
        });
      } catch (err) {
        console.error("Failed to render barcode:", err);
      }
    }
  }, [value, width, height, displayValue, fontSize]);

  if (!value) return null;

  return <svg ref={svgRef} className="max-w-full" />;
}

