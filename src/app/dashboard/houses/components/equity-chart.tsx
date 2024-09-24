"use client"

import * as React from "react";
import {CartesianGrid, Line, LineChart, XAxis} from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {Investment} from "@/app/dashboard/houses/components/chat-data-views";

// Define the type for chart data
interface EquityChartDataPoint {
    month: string;
    fhaEquity: number;
    convEquity: number;
}

export const EquityLineChart: React.FC<{ investment: Investment }> = ({
                                                                          investment,
                                                                      }) => {
    const {fhaLoan, nonFhaLoan} = investment;

    const chartData: EquityChartDataPoint[] = React.useMemo(() => {
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
                    fhaEquity: parseFloat(fhaProjection.equityRange.estimatedMinEquity),
                    convEquity: parseFloat(
                        nonFhaProjection.equityRange.estimatedMinEquity
                    ),
                });
            }
        }

        return data;
    }, [fhaLoan, nonFhaLoan]);

    const chartConfig = {
        equity: {
            label: "Projected Equity",
        },
        fhaEquity: {
            label: "FHA",
            color: "hsl(var(--chart-1))",
        },
        convEquity: {
            label: "Conventional",
            color: "hsl(var(--chart-2))",
        },
    } satisfies ChartConfig;

    const [activeChart, setActiveChart] = React.useState<
        keyof typeof chartConfig
    >("fhaEquity");

    // Calculate the total equity for each loan type
    const totalEquity = React.useMemo(
        () => ({
            fhaEquity: chartData.reduce((acc, curr) => acc + curr.fhaEquity, 0),
            convEquity: chartData.reduce((acc, curr) => acc + curr.convEquity, 0),
        }),
        [chartData]
    );

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
                        const chart = key as keyof typeof totalEquity;
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
                                <span className="text-lg font-bold leading-none sm:text-3xl">
                                    ${totalEquity[chart].toLocaleString()}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false}/>
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="equity"
                                    labelFormatter={(value) => value}
                                />
                            }
                        />
                        <Line
                            dataKey={activeChart}
                            type="monotone"
                            stroke={`var(--color-${activeChart})`}
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};