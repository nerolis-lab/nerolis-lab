import type { Chart, ChartData } from 'chart.js'

export function getBerryProdChartData(
  berryDistributions: Record<number, number>,
  berryColor: string
): ChartData<'bar'> {
  if (!berryDistributions) {
    return {
      labels: [],
      datasets: []
    }
  }

  const maxKey = Math.max(...Object.keys(berryDistributions).map(Number))
  const data = []

  for (let i = 0; i <= maxKey; i++) {
    data.push(berryDistributions[i] || 0)
  }

  return {
    labels: Array.from({ length: maxKey + 1 }, (_, i) => i.toString()),
    datasets: [
      {
        label: 'Berry Production Distribution',
        data,
        backgroundColor: `${berryColor}33`,
        borderColor: berryColor,
        borderWidth: 1
      }
    ]
  }
}

export function averageBerryProcsPlugin(averageKey: number, color: string) {
  return {
    id: 'averageBerryLine',
    afterDraw(chart: Chart) {
      const { ctx, chartArea, scales } = chart
      const xScale = scales.x

      if (averageKey >= xScale.min && averageKey <= xScale.max) {
        const xPosition = xScale.getPixelForValue(averageKey)

        ctx.save()
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(xPosition, chartArea.top)
        ctx.lineTo(xPosition, chartArea.bottom)
        ctx.stroke()

        ctx.font = '12px Arial'
        ctx.fillStyle = color
        ctx.textAlign = 'center'
        ctx.fillText('Average', xPosition, chartArea.top - 2)
        ctx.restore()
      }
    }
  }
}

export function getBerryProdChartOptions() {
  return {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      x: {
        title: {
          display: false
        },
        ticks: {
          color: '#FFFFFF'
        }
      },
      y: {
        ticks: {
          color: '#FFFFFF',
          callback: (value: number) => `${value}%`
        },
        beginAtZero: true,
        title: {
          display: false
        }
      }
    }
  }
}
