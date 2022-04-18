import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { OpenSeaPort, Network } from 'opensea-js';
import * as Web3 from 'web3';
import BN from 'bn.js';

import detectEthereumProvider from '@metamask/detect-provider';

export let web3Provider;

const AssetList = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  li {
    margin-right: 1rem;
    &:last-child {
      margin-right: 0;
    }
  }
`;
const ImageAsset = ({ asset }) => {
  const {
    image_thumbnail_url,
    description,
    name,
    permalink,
    is_presale,
  } = asset;
  return (
    <>
      <a href={permalink} target="_blank">
        <h3>{name}</h3>
        <img src={image_thumbnail_url} alt={description} />
        <br />
        {is_presale ? 'Presale' : 'Sale'}
      </a>
    </>
  );
};
const IndexPage = () => {
  const [stateAccountDetails, setStateAccountDetails] = useState({});
  const [stateSeaport, setStateSeaport] = useState(null);
  const [stateAssetCollection, setStateAssetCollection] = useState(
    []
  );
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
  const renderTokensForOwner = (ownerAddress) => {
    const options = {
      method: 'GET',
      headers: { Accept: 'application/json' },
    };
    const path = `https://api.opensea.io/api/v1/assets?owner=${ownerAddress}&order_direction=desc&limit=20&include_orders=false`;
    fetch(path, options)
      .then((response) => response.json())
      .then((response) => {
        setStateAssetCollection(response.assets);
      })
      .catch((err) => console.error(err));
  };
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

    renderTokensForOwner(accountAddress);

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
        <br />
        <AssetList>
          {stateAssetCollection.map((asset) => {
            return (
              <li key={`image_asset_${asset.id}`}>
                <ImageAsset asset={asset} />
              </li>
            );
          })}
        </AssetList>
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
