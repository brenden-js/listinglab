"use client"

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

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
import {LoanInfo} from "@/app/dashboard/houses/components/chat-data-views";

interface MortgagePaymentChartData {
  name: string;
  value: number;
  fill: string;
}

export const MortgagePaymentChart: React.FC<{ loan: LoanInfo }> = ({ loan }) => {
  const chartData: MortgagePaymentChartData[] = React.useMemo(() => {
    const data: MortgagePaymentChartData[] = [
      {
        name: "Principal & Interest",
        value: parseFloat(loan.baseMonthlyPayment),
        fill: "hsl(var(--chart-1))",
      },
    ];

    // Conditionally add MIP if it exists
    if (loan.monthlyMIP) {
      data.push({
        name: "Monthly MIP",
        value: parseFloat(loan.monthlyMIP),
        fill: "hsl(var(--chart-2))",
      });
    }

    // Add Monthly Taxes - always include, even if 0
    data.push({
      name: "Property Taxes",
      value: parseFloat(loan.monthlyTax || '0'), // Use 0 if loan.monthlyTax is empty string
      fill: "hsl(var(--chart-3))",
    });

    return data;
  }, [loan]);

  // Chart configuration
  const chartConfig = {
    paymentBreakdown: {
      label: "Monthly Payment Breakdown",
    },
  } satisfies ChartConfig;

  const totalPayment = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.value, 0),
    [chartData]
  );

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Monthly Mortgage Payment</CardTitle>
        <CardDescription>Breakdown of Costs</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {/* Use totalPayment for the center text */}
                          ${totalPayment.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
