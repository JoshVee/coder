import Box from "@mui/material/Box";
import { Theme } from "@mui/material/styles";
import useTheme from "@mui/styles/useTheme";
import {
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  defaults,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  PointElement,
} from "chart.js";
import "chartjs-adapter-date-fns";
import {
  HelpTooltip,
  HelpTooltipTitle,
  HelpTooltipText,
} from "components/HelpTooltip/HelpTooltip";
import dayjs from "dayjs";
import { FC } from "react";
import { Line } from "react-chartjs-2";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
);

const USER_LIMIT_DISPLAY_THRESHOLD = 60;

export interface ActiveUserChartProps {
  data: { date: string; amount: number }[];
  interval: "day" | "week";
  userLimit: number | undefined;
}

export const ActiveUserChart: FC<ActiveUserChartProps> = ({
  data,
  interval,
  userLimit,
}) => {
  const theme: Theme = useTheme();

  const labels = data.map((val) => dayjs(val.date).format("YYYY-MM-DD"));
  const chartData = data.map((val) => val.amount);

  defaults.font.family = theme.typography.fontFamily as string;
  defaults.color = theme.palette.text.secondary;

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      annotation: {
        annotations: [
          {
            type: "line",
            scaleID: "y",
            display: shouldDisplayUserLimit(userLimit, chartData),
            value: userLimit,
            borderColor: theme.palette.secondary.contrastText,
            borderWidth: 5,
            label: {
              content: "User limit",
              color: theme.palette.primary.contrastText,
              display: true,
              font: { weight: "normal" },
            },
          },
        ],
      },
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false,
        callbacks: {
          title: (context) => {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleDateString();
          },
        },
      },
    },
    scales: {
      y: {
        suggestedMin: 0,
        ticks: {
          precision: 0,
        },
      },

      x: {
        ticks: {
          stepSize: data.length > 10 ? 2 : undefined,
        },
        type: "time",
        time: {
          unit: interval,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Line
      data-chromatic="ignore"
      data={{
        labels: labels,
        datasets: [
          {
            label: `${interval === "day" ? "Daily" : "Weekly"} Active Users`,
            data: chartData,
            pointBackgroundColor: theme.palette.info.light,
            pointBorderColor: theme.palette.info.light,
            borderColor: theme.palette.info.light,
            backgroundColor: theme.palette.info.dark,
            fill: "origin",
          },
        ],
      }}
      options={options}
    />
  );
};

export const ActiveUsersTitle = () => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      Active Users
      <HelpTooltip size="small">
        <HelpTooltipTitle>How do we calculate active users?</HelpTooltipTitle>
        <HelpTooltipText>
          When a connection is initiated to a user&apos;s workspace they are
          considered an active user. e.g. apps, web terminal, SSH
        </HelpTooltipText>
      </HelpTooltip>
    </Box>
  );
};

function shouldDisplayUserLimit(
  userLimit: number | undefined,
  activeUsers: number[],
): boolean {
  if (!userLimit || activeUsers.length === 0) {
    return false;
  }
  return (
    Math.max(...activeUsers) >= (userLimit * USER_LIMIT_DISPLAY_THRESHOLD) / 100
  );
}
