import type { Chart, RadialLinearScale } from 'chart.js'
import { type ChartData, type Plugin } from 'chart.js'
import type { Ref } from 'vue'
import { onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'

export function generateIvData(themeVariables: { [x: string]: string }): Ref<ChartData<'radar'>> {
  const berry = themeVariables['berry']
  const skill = themeVariables['skill']
  const ingredient = themeVariables['ingredient']

  return ref<ChartData<'radar'>>({
    labels: ['Skill', 'Ingredient', 'Berry'],
    datasets: [
      {
        data: [0, 0, 0],
        borderColor: '#767d98',
        backgroundColor: '#5f6782AA',
        pointBorderColor: [skill, ingredient, berry],
        pointBackgroundColor: [skill, ingredient, berry]
      }
    ]
  })
}

export function generateIvTextPlugin(themeVariables: { [x: string]: string }): Plugin<'radar'> {
  const berry = themeVariables['berry']
  const skill = themeVariables['skill']
  const ingredient = themeVariables['ingredient']
  return {
    id: 'customPlugin',
    afterDraw(chart: Chart) {
      const ctx = chart.ctx
      const scale = chart.scales.r as RadialLinearScale
      const data = chart.config.data.datasets[0].data as number[]
      const labels = chart.config.data.labels as string[]

      if (!chart) return

      ctx.save()
      ctx.textAlign = 'center'

      // Iterate over each label and data value to draw the percentage and label
      labels.forEach((label, index) => {
        const position = scale.getPointPosition(index, scale.max)
        const value = `${data[index]}%`

        ctx.font = 'bold 18px Chakra Petch'
        if (index === 0) {
          ctx.fillStyle = skill
          ctx.fillText(value, position.x, position.y + 33)
          ctx.font = '10px Chakra Petch'
          ctx.fillText(label.toLowerCase(), position.x, position.y + 40)
        } else if (index === 1) {
          ctx.fillStyle = ingredient
          ctx.fillText(value, position.x - 35, position.y - 7)
          ctx.font = '10px Chakra Petch'
          ctx.fillText(label.toLowerCase(), position.x - 35, position.y)
        } else if (index === 2) {
          ctx.fillStyle = berry
          ctx.fillText(value, position.x + 30, position.y - 7)
          ctx.font = '10px Chakra Petch'
          ctx.fillText(label.toLowerCase(), position.x + 30, position.y)
        }
      })

      ctx.restore()
    }
  }
}

// Chart options
export const ivOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 10
    }
  },
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: {
        stepSize: 100,
        backdropColor: 'rgba(0, 0, 0, 0)',
        callback(value: number) {
          if (value === 100) {
            return ''
          }
          return value
        }
      },
      pointLabels: {
        display: false
      },
      grid: {
        color: '#fff',
        lineWidth: 1
      },
      angleLines: {
        color: '#fff',
        lineWidth: 1
      },
      afterFit(scale: { yCenter: number }) {
        scale.yCenter += 10
      }
    }
  },
  elements: {
    line: {
      borderWidth: 2
    }
  },
  plugins: {
    legend: {
      display: false
    },
    ivTextPlugin: generateIvTextPlugin
  }
}

export default {
  setup() {
    onMounted(() => {
      const skillColor = '#fff'
      const ingredientColor = '#aaa'
      const berryColor = '#000'

      generateIvData.value.datasets[0].pointBorderColor = [skillColor, ingredientColor, berryColor]
      generateIvData.value.datasets[0].pointBackgroundColor = [skillColor, ingredientColor, berryColor]
    })

    const theme = useTheme()
    console.log('hello', theme.current)

    return {
      ivData: generateIvData,
      ivOptions
    }
  }
}
