"use client";

import * as React from "react";

// Define data type interfaces
interface ChartDataItem {
  [key: string]: string | number;
}

// Define props interfaces
interface ResponsiveContainerProps {
  width?: number | string;
  height?: number | string;
  children: React.ReactNode;
  className?: string;
}

interface BarChartProps {
  data: ChartDataItem[];
  children: React.ReactNode;
  className?: string;
}

interface BarProps {
  dataKey: string;
  fill?: string;
  data?: ChartDataItem[];
}

interface XAxisProps {
  dataKey: string;
  data?: ChartDataItem[];
}

interface YAxisProps {
  className?: string;
}

// Create simple chart components
export function ResponsiveContainer({
  width = "100%",
  height = 300,
  children,
  className,
  ...props
}: ResponsiveContainerProps) {
  return (
    <div
      style={{ width, height }}
      className={`relative ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function BarChart({
  data = [],
  children,
  className,
  ...props
}: BarChartProps) {
  // Pass data to child components
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Using type assertion that preserves the element's props while adding the data prop
      return React.cloneElement(
        child as React.ReactElement<{ data?: ChartDataItem[] }>,
        { data }
      );
    }
    return child;
  });

  return (
    <div className={`w-full h-full ${className || ""}`} {...props}>
      {childrenWithProps}
    </div>
  );
}

export function Bar({
  dataKey,
  fill = "#8884d8",
  data = [],
  ...props
}: BarProps) {
  if (!data || !data.length) return null;

  return (
    <div className="pt-6 pb-2 h-full flex items-end space-x-2" {...props}>
      {data.map((entry: ChartDataItem, index: number) => {
        const value = (entry[dataKey] as number) || 0;
        const maxValue = Math.max(
          ...data.map((d: ChartDataItem) => (d[dataKey] as number) || 0)
        );
        const height = maxValue > 0 ? `${(value / maxValue) * 100}%` : "0%";

        return (
          <div
            key={`bar-${index}`}
            className="flex-1 flex flex-col items-center"
          >
            <div
              style={{ height, backgroundColor: fill }}
              className="w-full rounded-t-sm min-h-[4px] transition-all duration-500"
            />
          </div>
        );
      })}
    </div>
  );
}

export function XAxis({ dataKey, data = [], ...props }: XAxisProps) {
  if (!data || !data.length) return null;

  return (
    <div
      className="flex justify-between px-2 pt-2 text-xs text-muted-foreground"
      {...props}
    >
      {data.map((entry: ChartDataItem, index: number) => (
        <div
          key={`x-axis-${index}`}
          className="text-center truncate max-w-[80px]"
        >
          {entry[dataKey]}
        </div>
      ))}
    </div>
  );
}

export function YAxis({ className, ...props }: YAxisProps) {
  // In a real implementation, this would calculate and show tick values
  return (
    <div
      className={`absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-xs text-muted-foreground ${
        className || ""
      }`}
      {...props}
    >
      <div>100%</div>
      <div>75%</div>
      <div>50%</div>
      <div>25%</div>
      <div>0%</div>
    </div>
  );
}
