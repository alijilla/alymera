import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string | number;
}

export function StatsCard({ label, value }: StatsCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-medium text-gray-500">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  );
}
