import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip
} from 'chart.js'

export function registerChartJS() {
  ChartJS.register(
    RadarController,
    RadialLinearScale,
    BarController,
    BarElement,
    PointElement,
    LineElement,
    Filler,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
  )
}
