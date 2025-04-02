import React from "react";

type PillarStyle = "Gold" | "Red" | "Black";

type PillarStyleSelectorProps = {
  selectedStyle: PillarStyle;
  onStyleChange: (style: PillarStyle) => void;
};

const PillarStyleSelector: React.FC<PillarStyleSelectorProps> = ({
  selectedStyle,
  onStyleChange,
}) => {
  const styles: PillarStyle[] = ["Gold", "Red", "Black"];

  const getPillarSrc = (style: PillarStyle): string => {
    switch (style) {
      case "Gold":
        return "/stup_2200_goldnovi.svg";
      case "Red":
        return "/stup_2200_red.svg";
      case "Black":
        return "/stup_2200.svg";
      default:
        return "/stup_2200_goldnovi.svg";
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
      <h3 className="font-bold text-gray-800 mb-3">Pillar Style</h3>

      <div className="grid grid-cols-3 gap-2">
        {styles.map((style) => (
          <button
            key={style}
            className={`p-2 rounded-md transition-all ${
              selectedStyle === style
                ? "bg-secondary text-white ring-2 ring-secondary ring-offset-2"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => onStyleChange(style)}
          >
            {style}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <div className="text-sm font-medium text-gray-700 mb-1">
          Selected Style
        </div>
        <div className="h-24 flex justify-center items-center bg-gray-100 rounded-md p-2">
          <div
            className="h-20 w-12 bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${getPillarSrc(selectedStyle)}')` }}
          />
        </div>
      </div>

      <div className="mt-4 text-xs font-mono p-2 bg-gray-100 rounded overflow-auto">
        src: &quot;{getPillarSrc(selectedStyle)}&quot;
      </div>
    </div>
  );
};

export default PillarStyleSelector;
export type { PillarStyle };
