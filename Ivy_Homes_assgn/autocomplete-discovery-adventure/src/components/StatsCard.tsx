
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsCardProps {
  title: string;
  data: Array<{
    name: string;
    value: number;
  }>;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, data, color = '#333' }) => {
  return (
    <Card className="glass overflow-hidden border-border/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                hide 
                domain={[0, 'dataMax + 5']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: '6px',
                  fontSize: '12px',
                  padding: '4px 8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}
                itemStyle={{ padding: 0 }}
              />
              <Bar 
                dataKey="value" 
                fill={color} 
                radius={[4, 4, 0, 0]} 
                animationDuration={1000}
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
