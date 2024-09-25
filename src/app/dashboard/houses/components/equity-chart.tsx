"use client"

import { TrendingUp } from "lucide-react"
import {Line, LineChart, CartesianGrid, XAxis, Area, AreaChart} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Investment } from "@/app/dashboard/houses/components/chat-data-views"
import {useMemo, useState} from "react";

interface EquityChartDataPoint {
  month: string;
  fhaMinEquity: number;
  fhaMaxEquity: number;
  convMinEquity: number;
  convMaxEquity: number;
}

const chartConfig = {
  fhaEquity: {
    label: "FHA",
    color: "hsl(var(--chart-1))",
  },
  convEquity: {
    label: "Conventional",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export const EquityLineChart: React.FC<{ investment: Investment }> = ({
  investment,
}) => {
  const { fhaLoan, nonFhaLoan } = investment;

  const chartData: EquityChartDataPoint[] = useMemo(() => {
    const data: EquityChartDataPoint[] = [];

    for (let year = 1; year <= 30; year++) {
      const fhaProjection = fhaLoan.valueAndEquityRange.find(
        (item) => item.ownershipYear === year
      );
      const nonFhaProjection = nonFhaLoan.valueAndEquityRange.find(
        (item) => item.ownershipYear === year
      );

      if (fhaProjection && nonFhaProjection) {
        data.push({
          month: `Year ${year}`,
          fhaMinEquity: parseFloat(
            fhaProjection.equityRange.estimatedMinEquity
          ),
          fhaMaxEquity: parseFloat(
            fhaProjection.equityRange.estimatedMaxEquity
          ),
          convMinEquity: parseFloat(
            nonFhaProjection.equityRange.estimatedMinEquity
          ),
          convMaxEquity: parseFloat(
            nonFhaProjection.equityRange.estimatedMaxEquity
          ),
        });
      }
    }

    return data;
  }, [fhaLoan, nonFhaLoan]);

  const [activeChart, setActiveChart] = useState<
    keyof typeof chartConfig
  >("fhaEquity");

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Projected Equity Growth</CardTitle>
          <CardDescription>
            Comparison of FHA and Conventional Loans
          </CardDescription>
        </div>
        <div className="flex">
          {["fhaEquity", "convEquity"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillMinEquity" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMaxEquity" x1="0" y1="0" x2="0" y2="1">
                <stop
                    offset="5%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0.8}
                />
                <stop
                    offset="95%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area  // Area for Min Equity (background)
              dataKey={activeChart === 'fhaEquity' ? 'fhaMinEquity' : 'convMinEquity'}
              type="monotone"
              fill="url(#fillMinEquity)"
              stroke="transparent" // Hide the stroke of the Area
              strokeWidth={0}      // Ensure no stroke is visible
            />
            <Area  // Area for Max Equity (foreground)
              dataKey={activeChart === 'fhaEquity' ? 'fhaMaxEquity' : 'convMaxEquity'}
              type="monotone"
              fill="url(#fillMaxEquity)"
              stroke="transparent" // Hide the stroke of the Area
              strokeWidth={0}      // Ensure no stroke is visible
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
      </CardFooter>
    </Card>
  )
}