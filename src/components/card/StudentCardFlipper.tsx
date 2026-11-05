"use client";

import { useState } from "react";
import StudentCardFront from "./StudentCardFront";
import StudentCardBack from "./StudentCardBack";
import { RotateCw } from "lucide-react";

interface CardFlipperProps {
  school: any;
  student: any;
  major: any;
}

export default function StudentCardFlipper({
  school,
  student,
  major,
}: CardFlipperProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* 3D Flip Card Container */}
      <div
        className="cursor-pointer transition-transform duration-500 transform hover:scale-[1.02]"
        onClick={() => setIsFlipped(!isFlipped)}
        title="Klik untuk membalik kartu (Depan / Belakang)"
      >
        {!isFlipped ? (
          <StudentCardFront school={school} student={student} major={major} />
        ) : (
          <StudentCardBack school={school} student={student} major={major} />
        )}
      </div>

      {/* Button to flip */}
      <button
        type="button"
        onClick={() => setIsFlipped(!isFlipped)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-2xs border border-slate-200"
      >
        <RotateCw className="w-3.5 h-3.5 text-blue-600" />
        <span>Tampilkan Sisi {isFlipped ? "Depan" : "Belakang"}</span>
      </button>
    </div>
  );
}

