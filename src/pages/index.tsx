import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { OpenSeaPort, Network } from 'opensea-js';
import * as Web3 from 'web3';
import BN from 'bn.js';

import detectEthereumProvider from '@metamask/detect-provider';

export let web3Provider;

const IndexPage = () => {
  const [stateAccountDetails, setStateAccountDetails] = useState({});
  const [stateSeaport, setStateSeaport] = useState(null);
  const networkCallbacks = [];

  const onNetworkUpdate = (callback: any) => {
    networkCallbacks.push(callback);
  };

  useEffect(async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      web3Provider = provider;
    } else {
      web3Provider = new Web3.providers.HttpProvider(
        'https://mainnet.infura.io'
      );
    }

    onChangeAddress();
    onNetworkUpdate(onChangeAddress);
    return () => {};
  }, []);

  const onChangeAddress = async () => {
    const seaport = new OpenSeaPort(web3Provider, {
      networkName: Network.Main,
    });
    const web3 = seaport.web3;

    const gasPrice = await web3.eth.getGasPrice().then((res) => {
      return res;
    });
    const accountAddress = await web3.eth
      .getAccounts()
      .then((res) => {
        return res[0];
      });
    console.log('accountAddress', accountAddress);
    const accountBalance = await web3.eth
      .getBalance(accountAddress)
      .then((res) => {
        return res;
      });
    setStateAccountDetails({
      ...stateAccountDetails,
      gasPrice,
      accountAddress,
      accountBalance,
    });
    setStateSeaport(seaport);
  };

  return (
    <div>
      <Header>
        <h1>OpenSea SDK - MetaMask Compliant</h1>
      </Header>
      <main>
        <h3>Stats</h3>
        <ul>
          <li>
            Account Address:
            {stateAccountDetails &&
              stateAccountDetails.accountAddress}
            {!stateAccountDetails && 'Loading...'}
          </li>
          <li>Network.Main:{Network.Main}</li>
          {stateAccountDetails.gasPrice && (
            <li key="gasprice">
              Gas Price: {stateAccountDetails.gasPrice}
            </li>
          )}
          {stateAccountDetails.accountBalance && (
            <li key={'balance'}>
              Balance: {stateAccountDetails.accountBalance}
            </li>
          )}
        </ul>
      </main>
    </div>
  );
};

export default IndexPage;

const Header = styled.header`
  border-bottom: 1px solid lightgrey;
  padding: 10px;
  text-align: center;
  background-color: #f4f9fd;
  h6 img {
    width: 24px;
  }
`;
