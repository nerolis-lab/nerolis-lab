import { registerChartJS } from '@/components/custom-components/charts/register-charts'
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

describe('registerChartJS', () => {
  it('should register all necessary Chart.js components', () => {
    const registerSpy = vi.spyOn(ChartJS, 'register')

    registerChartJS()
    expect(registerSpy).toHaveBeenCalledWith(
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

    registerSpy.mockRestore()
  })
})
