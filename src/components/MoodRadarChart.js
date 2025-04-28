import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

const MoodRadarChart = () => {
  const { user } = useUser();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:3001/api/feeling/radar/${user.id}`)
      .then(res => res.json())
      .then(setData);
  }, [user]);

  return (
    <div className="w-full max-w-xl mx-auto mt-10">
      <h2 className="text-xl font-bold text-center mb-4">🧭 Emotional Balance</h2>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart outerRadius={120} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="feeling" />
          <PolarRadiusAxis angle={30} domain={[0, Math.max(...data.map(d => d.value), 5)]} />
          <Tooltip />
          <Radar name="Emotions" dataKey="value" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodRadarChart;
