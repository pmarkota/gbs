import React from "react";

type GradientDirection =
  | "to top"
  | "to top right"
  | "to right"
  | "to bottom right"
  | "to bottom"
  | "to bottom left"
  | "to left"
  | "to top left";

type GradientColorPickerProps = {
  fromColor: string;
  toColor: string;
  viaColor?: string;
  direction: GradientDirection;
  onFromColorChange: (color: string) => void;
  onToColorChange: (color: string) => void;
  onViaColorChange?: (color: string) => void;
  onDirectionChange: (direction: GradientDirection) => void;
  showViaColor?: boolean;
  label?: string;
};

const directionOptions: GradientDirection[] = [
  "to top",
  "to top right",
  "to right",
  "to bottom right",
  "to bottom",
  "to bottom left",
  "to left",
  "to top left",
];

const GradientColorPicker: React.FC<GradientColorPickerProps> = ({
  fromColor,
  toColor,
  viaColor,
  direction,
  onFromColorChange,
  onToColorChange,
  onViaColorChange,
  onDirectionChange,
  showViaColor = false,
  label = "Background Gradient",
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
      <h3 className="font-bold text-gray-800 mb-3">{label}</h3>

      <div className="flex flex-col gap-3 w-full">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                value={fromColor}
                onChange={(e) => onFromColorChange(e.target.value)}
                className="w-10 h-10 rounded mr-2"
              />
              <input
                type="text"
                value={fromColor}
                onChange={(e) => onFromColorChange(e.target.value)}
                className="flex-1 p-2 text-sm border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                value={toColor}
                onChange={(e) => onToColorChange(e.target.value)}
                className="w-10 h-10 rounded mr-2"
              />
              <input
                type="text"
                value={toColor}
                onChange={(e) => onToColorChange(e.target.value)}
                className="flex-1 p-2 text-sm border rounded"
              />
            </div>
          </div>
        </div>

        {showViaColor && onViaColorChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Via Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                value={viaColor || "#ffffff"}
                onChange={(e) => onViaColorChange(e.target.value)}
                className="w-10 h-10 rounded mr-2"
              />
              <input
                type="text"
                value={viaColor || "#ffffff"}
                onChange={(e) => onViaColorChange(e.target.value)}
                className="flex-1 p-2 text-sm border rounded"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Direction
          </label>
          <select
            value={direction}
            onChange={(e) =>
              onDirectionChange(e.target.value as GradientDirection)
            }
            className="w-full p-2 text-sm border rounded"
          >
            {directionOptions.map((dir) => (
              <option key={dir} value={dir}>
                {dir}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm font-medium text-gray-700 mb-1">Preview</div>
        <div
          className="h-16 w-full rounded-md border border-gray-300"
          style={{
            background:
              showViaColor && viaColor
                ? `linear-gradient(${direction}, ${fromColor}, ${viaColor}, ${toColor})`
                : `linear-gradient(${direction}, ${fromColor}, ${toColor})`,
          }}
        />
      </div>

      <div className="mt-4 text-xs font-mono p-2 bg-gray-100 rounded overflow-auto">
        background:{" "}
        {showViaColor && viaColor
          ? `linear-gradient(${direction}, ${fromColor}, ${viaColor}, ${toColor})`
          : `linear-gradient(${direction}, ${fromColor}, ${toColor})`}
        ;
      </div>
    </div>
  );
};

export default GradientColorPicker;
export type { GradientDirection };
