import Head from 'next/head'

import {
  WalletDisconnectButton,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'
import * as anchor from '@project-serum/anchor'
import { Program, Provider, BN } from '@project-serum/anchor'
import counterIDL from '../../target/idl/mlh_counter.json'
import { PublicKey, ConfirmOptions } from '@solana/web3.js'
import { useAnchorWallet } from '@solana/wallet-adapter-react'

import { useState, useEffect } from 'react'

type counterState = {
  program: any
  connection: any
  counter: any
}

export default function Home() {
  const wallet = useAnchorWallet()
  const [appState, setAppState] = useState({} as counterState)

  const getState = async () => {
    const mlhIdl = counterIDL as anchor.Idl

    const opts = {
      preflightCommitment: 'processed' as ConfirmOptions,
    }
    const endpoint = 'https://api.devnet.solana.com'
    const connection = new anchor.web3.Connection(
      endpoint,
      opts.preflightCommitment
    )
    const aWallet = wallet as typeof anchor.Wallet
    const provider = new Provider(connection, aWallet, opts.preflightCommitment)
    const mlhCounter = new anchor.web3.PublicKey(
      '7nUsE6D9TwY3dDrASLTkyRiEgqeiW9qx8CwsJqNYC7eu'
    )

    const program = new Program(mlhIdl, mlhCounter, provider)

    // const [counter, _counterBump] =
    //   await anchor.web3.PublicKey.findProgramAddress(
    //     [wallet!.publicKey.toBuffer()],
    //     program.programId
    //   )

    const counter = await program.account.counter.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: wallet!.publicKey.toBase58(),
        },
      },
    ])

    console.log('counter: ', counter[0].publicKey.toString())

    setAppState({
      program,
      connection,
      counter: counter[0],
    })
  }

  const initCounter = async () => {
    const [counter, counterBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [wallet!.publicKey.toBuffer()],
        appState.program.programId
      )

    await appState.program.rpc.initialize(counterBump, {
      accounts: {
        authority: appState.program.provider.wallet.publicKey,
        counter: counter,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    })
  }
  const updateCounter = async () => {
    await appState.program.rpc.update({
      accounts: {
        authority: appState.program.provider.wallet.publicKey,
        counter: appState.counter.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    })
  }

  useEffect(() => {
    if (wallet?.publicKey) {
      getState()
    }
  }, [wallet])
  return (
    <div className="flex content-center items-center p-16">
      <div className="bg-base-300 mockup-window m-16">
        <div>
          <WalletMultiButton />
        </div>
        {!appState.counter ? (
          <button className="btn" onClick={initCounter}>
            Init Counter
          </button>
        ) : (
          <div>
            <p>Count: {appState.counter.account.count.toString()}</p>
            <button className="btn" onClick={updateCounter}>
              Update Counter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
