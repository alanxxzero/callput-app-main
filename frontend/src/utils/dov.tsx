import { advancedFormatNumber } from '@/utils/helper'
import dayjs from 'dayjs'
import { getContractAddress } from './contract'
import { network$ } from '@/streams/store'
import { DOV_TICKER_TO_DECIMAL,  } from './assets'
import { UA_TICKER_TO_INDEX } from '@/networks/assets'
import { getUnderlyingAssetIndexByTicker } from '@/networks/helpers'
import { getInstrumentOptionDataFromMarket, UnderlyingAsset } from '@moby/shared'

const TICK_SIZE: any = () => ({
  [UA_TICKER_TO_INDEX[network$.value].BTC]: 500, 
  [UA_TICKER_TO_INDEX[network$.value].ETH]: 25,
})

const MIN_MARK_PRICE: any = () => ({
  [UA_TICKER_TO_INDEX[network$.value].BTC]: 60, 
  [UA_TICKER_TO_INDEX[network$.value].ETH]: 3,
})

export const get0DTEActiveInstruments = (marketData: any) => {
  const allOptionIdMap = getInstrumentOptionDataFromMarket(marketData)

  const now = dayjs().unix()

  const activeInstruments: any = Object.entries(allOptionIdMap)
    .filter(([key, val]: any) => !!val.isOptionAvailable) // option available filter
    .filter(([key, val]: any) => {
      const leftSeconds = val.expiry - now

      return leftSeconds > 0 && leftSeconds < 86400
    }) // 0DTE filter
    .map(([key, val]: any) => {
      const isCall = val.instrument.endsWith('C')

      return {
        ...val,
        isCall,
      }
    })

  return activeInstruments
}

export const getTargetStrikePricesText = ({ activeInstruments, strategy, spotPrice }: any) => {
  
  if (strategy == "Iron Condor") {
    const ironCondorResult: any = findIronCondorCandidates({ activeInstruments, spotPrice })

    const isAvailable =  !ironCondorResult 
      || ironCondorResult?.length != 0 
      || ironCondorResult?.callSpreadInstruments && ironCondorResult?.callSpreadInstruments.length == 0
      || ironCondorResult?.putSpreadInstruments && ironCondorResult?.putSpreadInstruments.length == 0

    if (!isAvailable) return "N/A"

    const callSpreadStrikePrices = ironCondorResult?.callSpreadInstruments.map((instrument: any) => instrument.strikePrice)
    const putSpreadStrikePrices = ironCondorResult?.putSpreadInstruments.map((instrument: any) => instrument.strikePrice)

    if (!callSpreadStrikePrices || !putSpreadStrikePrices) return "N/A"

    return (
      <>
        <p>Call {advancedFormatNumber(callSpreadStrikePrices[0], 0)} {advancedFormatNumber(callSpreadStrikePrices[1], 0)}</p>
        <p>Put {advancedFormatNumber(putSpreadStrikePrices[0], 0)} {advancedFormatNumber(putSpreadStrikePrices[1], 0)}</p>
      </>
    )
  }
}

export const findIronCondorCandidates = ({ spotPrice, activeInstruments }: any) => {
  const assetIndex = getUnderlyingAssetIndexByTicker(network$.value, UnderlyingAsset.BTC)

  const minMarkPrice = MIN_MARK_PRICE()[assetIndex]

  // FIXME: the length of call & put spread candidates is different as the btc price arises more than 100k
  // find +- ~2% price range
  // Call spread: ~ +3.5% 
  // Put spread: ~ -3.5%
  const spreadPercent = 0.035

  const targetCallSpreadStrikePrice = spotPrice * (1 + spreadPercent)
  const targetPutSpreadStrikePrice = spotPrice * (1 - spreadPercent)

  const callSpreadCandidates: any = activeInstruments.filter((instrument: any) => {
    return instrument.strikePrice >= spotPrice &&
      instrument.strikePrice <= targetCallSpreadStrikePrice &&
      instrument.isCall
  })
  .sort((a: any, b: any) => {
    const a_targetDiff = Math.abs(targetCallSpreadStrikePrice - a.strikePrice)
    const b_targetDiff = Math.abs(targetCallSpreadStrikePrice - b.strikePrice)
    return a_targetDiff - b_targetDiff
  })

  const putSpreadCandidates: any = activeInstruments.filter((instrument: any) => {
    return instrument.strikePrice <= spotPrice &&
      instrument.strikePrice >= targetPutSpreadStrikePrice &&
      !instrument.isCall
  }).sort((a: any, b: any) => {
    const a_targetDiff = Math.abs(targetPutSpreadStrikePrice - a.strikePrice)
    const b_targetDiff = Math.abs(targetPutSpreadStrikePrice - b.strikePrice)
    return a_targetDiff - b_targetDiff
  })

  const callSpreadInstruments = _findTargetInstruments(activeInstruments, callSpreadCandidates, minMarkPrice).sort((a, b) => a.strikePrice - b.strikePrice)
  const putSpreadInstruments = _findTargetInstruments(activeInstruments, putSpreadCandidates, minMarkPrice).sort((a, b) => b.strikePrice - a.strikePrice)

  if (callSpreadInstruments.length == 0 || putSpreadInstruments.length == 0) {
    // Not found
    return null
  }

  const callBaseCollateralAmount = Math.abs(callSpreadInstruments[0].strikePrice - callSpreadInstruments[1].strikePrice)
  const putBaseCollateralAmount = Math.abs(putSpreadInstruments[0].strikePrice - putSpreadInstruments[1].strikePrice)

  return { 
    callSpreadInstruments, 
    putSpreadInstruments,
    callBaseCollateralAmount,
    putBaseCollateralAmount,
  }
}

const _findTargetInstruments = (activeInstruments: any, candidateInstruments: any, minMarkPrice: number) => {

  const assetIndex = getUnderlyingAssetIndexByTicker(network$.value, UnderlyingAsset.BTC)

  const result: any = []
  const isCall = candidateInstruments[0]?.isCall

  for (let i = 0; i < candidateInstruments.length; i++) {
    
    const instrument1 = candidateInstruments[i]
    
    const instrument2 = activeInstruments.find((instrument: any) => {
      return instrument.expiry == instrument1.expiry &&
      instrument.isCall == isCall &&
      Number(instrument.strikePrice) == (instrument1.strikePrice + (TICK_SIZE()[assetIndex] * 2 * (isCall ? 1 : -1)))
    })

    if (!instrument2?.isOptionAvailable) continue

    const markPrice = instrument1.markPrice > instrument2.markPrice 
      ? instrument1.markPrice - instrument2.markPrice
      : instrument2.markPrice - instrument1.markPrice

    if (markPrice > minMarkPrice) {
      result.push({ instrument1, instrument2 })
    } 
  }

  if (result.length == 0) {
    return []
  }

  return [result[0].instrument1, result[0].instrument2]
}

export const extendTokenIngredients = (tokens: any) => {
  return tokens.map((token: any) => ({ ...token, address: getContractAddress(token.symbol as any, network$.value), decimal: DOV_TICKER_TO_DECIMAL[token.symbol as any] }))
}

