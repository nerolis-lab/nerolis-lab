import type { Chart, ChartData } from 'chart.js'

export function getSkillProcChartData(
  skillDistributions: Record<number, number>,
  skillColor: string
): ChartData<'bar'> {
  if (!skillDistributions) {
    return {
      labels: [],
      datasets: []
    }
  }

  const maxKey = Math.max(...Object.keys(skillDistributions).map(Number))
  const data = []

  for (let i = 0; i <= maxKey; i++) {
    data.push(skillDistributions[i] || 0)
  }

  return {
    labels: Array.from({ length: maxKey + 1 }, (_, i) => i.toString()),
    datasets: [
      {
        label: 'Skill Proc Distribution',
        data,
        backgroundColor: `${skillColor}33`, // Add some transparency
        borderColor: skillColor,
        borderWidth: 1
      }
    ]
  }
}

export function averageSkillProcsPlugin(averageKey: number, color: string) {
  return {
    id: 'averageLine',
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

        // Add label for the average line
        ctx.font = '12px Arial'
        ctx.fillStyle = color
        ctx.textAlign = 'center'
        ctx.fillText('Average', xPosition, chartArea.top - 2)
        ctx.restore()
      }
    }
  }
}

export function getSkillProcChartOptions() {
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
