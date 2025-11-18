import { advancedFormatBigNumber, advancedFormatNumber } from "@/utils/helper";
import { graphic } from 'echarts'

export enum DayRange {
  D30 = '30',
  D60 = '60',
  D180 = '180'
}

export enum Tab {
  Volume = "Volume",
  FeesAndRP = "Fees & RP",
  PNL = "PnL"
}

export const defaultOption = {
  grid: {
    left: '28px',
    right: '36px',
    bottom: '32px',
    top: '64px',
    containLabel: true
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#1F1F1F',
    borderColor: "rgba(230, 252, 141, 0.10)",
    extraCssText: "padding-left:16px; padding-right:16px; border-radius:4px;",
    textStyle: {
      fontFamily: 'Graphie',
      fontSize: 14,
      fontWeight: 600,
      color: '#808080'
    },
    formatter: function(params: any) {
      let message = `<text style="margin-bottom:8px;">${params[0].axisValue}</text>`

      message += params.reduce((acc: any, param: any) => {
        const data = param.data
        const seriesName = param.seriesName

        const colorHex = '#E6FC8D'

        return acc + `<br/> <text style="color:${colorHex};">${advancedFormatNumber(data, 0, "$", true)}</text>`
      }, "")

      return message
    }
  },
  xAxis: {
    type: 'category',
    data: [],
    boundaryGap: false,
    axisLine: {
      show: false 
    },
    axisTick: {
      show: false,
    },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      margin: 32,
      formatter: (value: number) => {
        if (value == 0) return ""
        return '$' + advancedFormatBigNumber(value, true)
      },
    },
    splitLine: {
      show: false
    }
  },
  series: [
    {
      type: 'bar',
      data: [],
      showSymbol: false,
      smooth: true,
      barCategoryGap: '0%',    
      barGap: '0%',
      itemStyle: {
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: '#ACB881'
          },
          {
            offset: 1,
            color: '#4D5239'
          }
        ]),
        emphasis: {
          color: '#E6FC8D'
        }
      },

      areaStyle: {
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: '#2F3143'
          },
          {
            offset: 1,
            color: '#1A1A1A'
          }
        ])
      }
    }
  ]
};