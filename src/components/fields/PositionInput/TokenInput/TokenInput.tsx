import { Coin } from '@cosmjs/proto-signing'
import classNames from 'classnames/bind'
import { Button, DisplayCurrency, NumberInput } from 'components/common'
import { findByDenom } from 'functions'
import { useAsset } from 'hooks/data'
import { formatValue, magnify } from 'libs/parse'
import { useTranslation } from 'react-i18next'
import useStore from 'store'

import styles from './TokenInput.module.scss'

interface Props {
  tokens: string[]
  input: Input
  amount: number
  maxAmount?: number
  maxAmountLabel: string
  borrowRate?: number
  onChange: (amount: number) => void
  onSelect?: (denom: string) => void
}

export const TokenInput = (props: Props) => {
  const userBalances = useStore((s) => s.userBalances)
  const { t } = useTranslation()

  const walletBalance = findByDenom(userBalances, props.input.denom) as Coin
  const asset = useAsset({ denom: props.input.denom })
  const isSingleToken = props.tokens.length === 1
  const inputClasses = classNames([
    styles.input,
    'number',
    's',
    styles.secondary,
    isSingleToken && styles.singleToken,
  ])
  const selectClasses = classNames([styles.select, 's', isSingleToken && styles.disabled])
  const containerClasses = classNames([
    styles.container,
    styles.secondary,
    props.borrowRate !== undefined && styles.isBorrow,
  ])

  const onValueEntered = (newValue: number) => {
    let microValue = Number(magnify(newValue, asset?.decimals || 0))

    if (props.maxAmount !== undefined) {
      if (microValue >= (props.maxAmount ?? 0)) microValue = props.maxAmount
    } else {
      if (!walletBalance?.amount) microValue = 0
      if (microValue >= (Number(walletBalance?.amount) ?? 0))
        microValue = Number(walletBalance?.amount)
    }
    props.onChange(microValue)
  }

  if (!asset) return <></>

  const maxAmount =
    (props.maxAmount === undefined ? Number(walletBalance.amount) : props.maxAmount) /
    10 ** asset.decimals

  return (
    <div className={styles.wrapper}>
      <Button
        color='quaternary'
        className={`xxsCaps faded ${styles.maxBtn}`}
        onClick={() => onValueEntered(maxAmount)}
        text={`${props.maxAmountLabel}: ${maxAmount}`}
        variant='transparent'
      />
      <div className={styles.input}>
        <div className={containerClasses}>
          <NumberInput
            onChange={onValueEntered}
            onFocus={() => {}}
            onBlur={() => {}}
            maxValue={(props.maxAmount || 0) / 10 ** asset.decimals}
            value={(props.amount / 10 ** asset.decimals).toString()}
            maxDecimals={6}
            suffix={isSingleToken ? ` ${props.input.symbol}` : ''}
            className={inputClasses}
          />
          {!isSingleToken && (
            <>
              <div className={styles.divider} />
              <select
                onChange={(e) => props.onSelect && props.onSelect(e.target.value)}
                className={selectClasses}
                tabIndex={isSingleToken ? -1 : 0}
                value={props.input.symbol}
              >
                {props.tokens.map((token) => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>
      <div className={styles.bottomInfo}>
        <DisplayCurrency
          prefixClass='xxsCaps faded'
          valueClass='xxsCaps faded'
          coin={{ denom: asset.denom, amount: props.amount.toString() }}
        />
        {props.borrowRate && (
          <span className='xxsCaps number faded'>
            {formatValue(props.borrowRate, 2, 2, true, false, `% ${t('common.apr')}`)}
          </span>
        )}
      </div>
    </div>
  )
}
