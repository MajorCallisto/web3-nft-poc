import * as Web3 from 'web3';
import { OpenSeaPort, Network } from 'opensea-js';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';

const MainStyled = styled.main`
  color: '#232129';
  padding: '1rem';
  font-family: Droid Sans, sans-serif, serif;
  li {
    &:hover {
      font-weight: bold;
    }
    a {
      &:hover,
      &:visited,
      &:link,
      &:active {
        text-decoration: none;
        color: #000;
      }
    }
  }
`;
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
const ErrorMSG = styled.div`
  color: red;
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

// markup
const IndexPage = () => {
  const [stateCurrentAddress, setStateCurrentAddress] = useState('');
  const [stateErrorMsg, setStateErrorMsg] = useState(null);
  const [stateAssetCollection, setStateAssetCollection] = useState(
    []
  );
  const handleBurn = useCallback(async () => {
    const ethersWeb3 = new ethers.providers.Web3Provider(
      window.ethereum
    );
    await ethersWeb3.send('eth_requestAccounts', []);
    const signer = ethersWeb3.getSigner();
    const address = await signer.getAddress();
    try {
      const seaport = new OpenSeaPort(ethersWeb3.provider, {
        networkName: Network.Rinkeby,
      });

      // const assets = [
      //   {
      //     tokenId: 5528,
      //     tokenAddress: selectedNetwork.mainContractAddress,
      //   },
      // ];

      // const transactionHash = await seaport.transferAll({
      //   assets,
      //   fromAddress: address,
      //   toAddress: '0x000000000000000000000000000000000000dEaD',
      // });
    } catch (e) {
      console.error(`Error while burning: ${e.message}`);
      console.error(e);
    }
  }, []);

  const updateAccountInformation = async () => {
    let accountAddress;
    accountAddress = await connect();
    renderTokensForOwner(accountAddress);
  };
  useEffect(async () => {
    handleBurn();
    // updateAccountInformation();

    // window.ethereum.on('accountsChanged', updateAccountInformation);
    return () => {};
  }, []);

  const connect = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const provider = new ethers.providers.Web3Provider(
          window.ethereum
        );
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const accountAddress = await signer.getAddress();

        setStateCurrentAddress(accountAddress);
        resolve(accountAddress);
      } catch (error) {
        const errorMsg =
          error.code === -32002
            ? `Check MetaMask. \n${error.message}`
            : error.message;
        setStateErrorMsg(errorMsg);
        // reject(error);
      }
    });
  };

  const renderTokensForOwner = (ownerAddress) => {
    const options = {
      method: 'GET',
      headers: { Accept: 'application/json' },
    };
    const path = `https://api.opensea.io/api/v1/assets?owner=${ownerAddress}&order_direction=desc&limit=20&include_orders=false`;
    console.log(path);
    fetch(path, options)
      .then((response) => response.json())
      .then((response) => {
        setStateAssetCollection(response.assets);
      })
      .catch((err) => console.error(err));
  };

  // const createTokenElement = ({
  //   name,
  //   collection,
  //   description,
  //   permalink,
  //   image_preview_url,
  //   token_id,
  // }) => {
  //   const newElement = document
  //     .getElementById('nft_template')
  //     .content.cloneNode(true);

  //   newElement.querySelector(
  //     'section'
  //   ).id = `${collection.slug}_${token_id}`;
  //   newElement.querySelector('h1').innerText = name;
  //   newElement.querySelector('a').href = permalink;
  //   newElement.querySelector('img').src = image_preview_url;
  //   newElement.querySelector('img').alt = description;

  //   return newElement;
  // };

  return (
    <MainStyled>
      <title>Home Page</title>
      <h1>Testing Web3</h1>
      Current Address: <div>{stateCurrentAddress}</div>
      <ErrorMSG>{stateErrorMsg}</ErrorMSG>
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
    </MainStyled>
  );
};

export default IndexPage;
