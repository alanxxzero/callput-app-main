import { advancedFormatNumber } from "@/utils/helper";
import { graphic } from 'echarts'

export enum DayRange {
  D30 = '30',
  D60 = '60',
  D180 = '180'
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
    extraCssText: "width: 100px; height:90px; padding-left:16px; border-radius:4px;",
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

        const colorHex = seriesName === 'OLP Token Value + Distributed ETH Reward' 
          ? '#7B8DE8' 
          : '#ACB881'

        return acc + `<br/> <text style="color:${colorHex};">${advancedFormatNumber(data, 3, "$", false)}</text>`
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
        return advancedFormatNumber(value, 2, "$", false)
      },
    },
    splitLine: {
      show: false
    }
  },
  legend: {
    data: [
      'OLP Token Value + Distributed ETH Reward',
      'OLP Token Value (Price)'
    ],
    itemGap: 6,
    left: '64px',
    top: '0px',  
    orient: 'vertical',
    textStyle: {
      fontFamily: 'graphie',
      fontSize: 12,
      fontWeight: 600,
      color: '#808080',
    },
    itemWidth: 12,
    itemHeight: 3,
    icon: 'rect' 
  },
  series: [
    {
      name: 'OLP Token Value + Distributed ETH Reward',
      type: 'line',
      data: [],
      showSymbol: false,
      smooth: true,
      lineStyle: {
        width: 2
      },
      itemStyle: {
        color: '#7B8DE8'
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
    },
    {
      name: 'OLP Token Value (Price)',
      type: 'line',
      data: [],
      showSymbol: false,
      smooth: true,
      lineStyle: {
        width: 2
      },
      itemStyle: {
        color: '#ACB881'
      },
      areaStyle: {
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: '#353732'
          },
          {
            offset: 1,
            color: '#1A1A1A'
          }
        ])
      }
    },
  ]
};