import React, { useState, useEffect, useRef } from 'react';

import { SiWebpack, AiFillTwitterCircle, RiDiscordLine, SiMarketo, BsCircleFill } from 'react-icons/all';
import { ProgressBar } from 'react-bootstrap';
import tokenLogo from '../../assets/img/logo.png';
import MyModal from '../modal/Modal';
import BuyModal from '../modal/BuyModal';
import { useEthers, useTokenBalance } from "@usedapp/core";
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { Toast} from 'react-bootstrap';
import { 
    useAirdropContractMethod, 
    useSuniTokenContractMethod,
    useGetLastClaimedTime,
    useGetTotalClaimableAmount
} from '../../util/interact';
import { 
    suniTokenAddress, 
    nftTokenAddress,
    verificationCode 
} from '../../contract_ABI/vestingData';
import { useMoralis } from "react-moralis";

export default function TokenDetail() {
    const {
		Moralis,
		user,
		logout,
		authenticate,
		enableWeb3,
		isInitialized,
		isAuthenticated,
		isWeb3Enabled,
	} = useMoralis();

    const serverUrl = "https://cpv80vvgo3py.usemoralis.com:2053/server";
    const appId = "wLREEVSDVuKj2A42TeKCeuYVw4jkVwiRXsgnalj0";
    Moralis.start({serverUrl:serverUrl, appId :appId});
    
    const getOrder = async (tokenID) => {
		const res = await Moralis.Plugins.opensea.getOrders({
			network: "mainnet",
			tokenAddress: nftTokenAddress,
			tokenId: tokenID,
			orderSide: 0, // 0 is for buy orders, 1 is for sell orders
			page: 1, // pagination shows 20 orders each page
		});

        return res;
	};

    const unmounted = useRef(true);
    const project = {
        name: 'SUNI',
        status: 'Open',
        message: 'Any nft holders who holds nft for 12 days in wallet without listing for sale on opensea or transfer will start getting daily 7$ SUNI token from 13th day'
    };

    const currentTime = Math.round(new Date().getTime()/1000);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenBuy, setIsOpenBuy] = useState(false);
    const [showToastBuy, setShowToastBuy] = useState(false);
    const [toastTextBuy, setToastTextBuy] = useState('');
    const {account, chainId} = useEthers();

    const [myNfts, setMyNfts] = useState([]);
    const [myTokenIds, setMyTokenIds] = useState([]);
    const [myStartTimes, setMyStartTimes] = useState([]);
    
    const suniBalance = useTokenBalance(suniTokenAddress, account) / 10 ** 18;
    const[nftBalance, setNftBalance] = useState('');
    const lastClaimedTime = useGetLastClaimedTime(account, myTokenIds[0]);

    const totalClaimableAmount = useGetTotalClaimableAmount(myTokenIds, myStartTimes, account) / 10 ** 18;
    useEffect( () => {
        Moralis.start({ serverUrl, appId});

        if (isInitialized) {
			Moralis.initPlugins();
		}
        return () => { unmounted.current = false }
    }, []);

    useEffect( () => {
        getMyNft();
        claimToken('get');
        return () => { unmounted.current = false }
    }, [myNfts, account]);
 
    function getMyNft() {
        var options1 = {
            method: 'GET',
            url: 'https://deep-index.moralis.io/api/v2/' + account + '/nft/' + nftTokenAddress + '?chain=eth&format=decimal',
            headers: {Accept: 'application/json', 'X-API-KEY': 'aF6jKJDYuy0p8jXoA9hSwJn68VMevh9XKrENKU2XzMFRjTPAcjp1nHeDE6JESV2L'}
        };

        axios.request(options1).then(function (response) {
            let myNfts_tmp = [];
            let result = response.data.result;
            result.map((item) => {
                myNfts_tmp.push({
                    token_id: item.token_id,
                    owner_of: item.owner_of,
                    token_address: item.token_address,
                });
            });
            setNftBalance(response.data.result.length);
            setMyNfts(myNfts_tmp);
          }).catch(function (error) {
            console.error(error);
        });
    }

    const { state: stateDoAirdrop, send: doAirdrop, events: getEventDoAirdrop } = useAirdropContractMethod("doAirdrop");
    function claimToken(option) {
        var options2 = {
            method: 'GET',
            url: 'https://deep-index.moralis.io/api/v2/' + account + '/nft/transfers?chain=eth&format=decimal&direction=both',
            headers: {Accept: 'application/json', 'X-API-KEY': 'aF6jKJDYuy0p8jXoA9hSwJn68VMevh9XKrENKU2XzMFRjTPAcjp1nHeDE6JESV2L'}
        };

        axios.request(options2).then(function (response) {
            let claimReqInfo = [];
            let tokenIds = [];
            let startTimes = [];
            let transferInfo = response.data.result;
            let flag;
            myNfts.map((nftItem) => {
                flag = 0;
                transferInfo.map((transferItem) => {
                    if(nftItem.token_id == transferItem.token_id && nftItem.owner_of == transferItem.to_address && nftItem.token_address == transferItem.token_address && flag == 0) {
                        let startTimestamp = new Date(transferItem.block_timestamp);
                        startTimestamp = Number(startTimestamp.getTime() / 1000).toString();
                        if(startTimestamp < 1643144400){ // If hold date is less 14th Jan 2022, it set 2022/1/14
                            startTimestamp = 1643144400;
                        } else{
                            let days = parseInt(startTimestamp / 86400);
                            startTimestamp = days * 86400 - 3600 * 3;
                        }
                        
                        const isList = getOrder(29);
                        tokenIds.push(Number(nftItem.token_id).toString());
                        startTimes.push(startTimestamp);

                        claimReqInfo.push({
                            token_id: nftItem.token_id,
                            owner_of: nftItem.owner_of,
                            token_address: nftItem.token_address,
                            startTimestamp: startTimestamp,
                        });
                        flag = 1;
                    }
                });
            });
            
            if(option == 'claim'){
                doAirdrop(tokenIds, startTimes, verificationCode);
            }          
            else if(option == 'get'){
                setMyTokenIds(tokenIds);
                setMyStartTimes(startTimes);
            }

          }).catch(function (error) {
            console.error(error);
            return false;
        });

        // setIsOpenBuy(true);
    }

    useEffect( () => {
        if(stateDoAirdrop.status == 'Success') {
            setToastTextBuy("Claiming successfully!");
            setShowToastBuy(true);
        }else if(stateDoAirdrop.status == 'Exception') {
            setToastTextBuy(stateDoAirdrop.errorMessage);
            setShowToastBuy(true);
        }
        return () => { unmounted.current = false }
    }, [ stateDoAirdrop ]);

    return (
        <>
            <Container>
                <Row>
                    <Col sm={5}>
                        <section className="mt-auto">
                            <div className="toekn-detail-header d-flex mt-5">
                                <div className="custom-card-title"><img className="tokenLogo mt-auto" src={tokenLogo} alt="project profile"></img></div>
                                <div className="custom-card-title"><h2 className="text-white mb-auto  tokenLogoTitle">Sassy Unicorns</h2></div>
                            </div>
                            <div className="custom-card-header">
                                <div className="custom-card-title">
                                    <div className="grid-box">
                                        <div className="text-white my-0 ml-3" style={{fontSize: '1.5rem'}}>SUNI</div>
                                        <div className="social-links">
                                            <a href="https://sassyunicorns.io/"><SiWebpack className="social-link" /></a>
                                            <a href="https://twitter.com/SassyUnicornNFT"><AiFillTwitterCircle className="social-link" /></a>
                                            <a href="https://discord.gg/2PjVUrJvDJ"><RiDiscordLine className="social-link" /></a>
                                            <a href="https://opensea.io/collection/sassy-unicorns"><SiMarketo className="social-link" /></a>
                                        </div>
                                        <div></div>
                                    </div>
                                    <span className="status" style={{ backgroundColor: `${project.status === 'Coming' ? 'rgb(240 185 19 / 26%)' : project.status === 'Open' ? 'rgb(92 184 92 / 26%)' : 'rgb(255 0 0 / 25%)'}`, color: `${project.status === 'Coming' ? '#f1b90c' : project.status === 'Open' ? '#5cb85c' : 'red'}` }}>
                                        <BsCircleFill style={{ fontSize: '.6rem', verticalAlign: 'middle' }} />
                                        {project.status === 'Coming' ? ' Opens in TBA' : project.status === 'Open' ? ' Active' : ' Closed'}
                                    </span>
                                    <div className="buyBtnContainer d-flex">
                                        <span className="status">Passive Income</span>
                                        <span className="status">Airdrop</span>
                                    </div>
                                    <div className="social-links">
                                    </div>
                                    <div className="text-white my-4">
                                        <div className="my-2">
                                            {project.message}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </Col>
                    <Col sm={7}>
                        <section className="custom-card text-gray">
                            <div className="grid-box">
                                <div> Your SUNI Balance </div>
                                <div>  </div>
                            </div>
                            <div className="grid-box text-white">
                                <div style={{paddingRight: '3rem'}}> {!suniBalance ? ('-') : (suniBalance + ' SUNI')} </div>
                                <div>
                                    {(account && nftBalance && totalClaimableAmount > 0) && (
                                        <button className="btn btn-wallet wallet-connected" onClick={ ()=>{
                                            claimToken('claim')} }> Claim SUNI Token </button>
                                    ) }
                                </div>
                            </div>
                            <hr className="bg-gray-100" />
                            <div className="grid-box">
                                <div> Hold NFT </div>
                                <div> Total Claimable Amount: </div>
                            </div>
                            <div className="grid-box text-white">
                                <div> { nftBalance ? nftBalance * 1 : '-' } </div>
                                <div> { nftBalance ? Number(totalClaimableAmount) + ' SUNI' : '-' } </div>
                            </div>
                            <div className="grid-box text-white">
                                <div>  </div>
                                <div> { nftBalance ? Number(totalClaimableAmount) + ' USD' : '-'  } </div>
                            </div>
                            <hr className="bg-gray-100" />
                            <div className="grid-box">
                                <div> Start Date </div>
                                <div> Staking period: </div>
                            </div>
                            <div className="grid-box text-white">
                                <div> { (nftBalance && myStartTimes[0]) &&(lastClaimedTime != 0 ? new Date(lastClaimedTime * 1000).toLocaleString("en-US", {timeZone: "UTC"}) : new Date(myStartTimes[0] * 1000).toLocaleString("en-US", {timeZone: "UTC"}) ) || '-'              
                                
                                } </div>
                                <div> {12 + ' days'} </div>
                            </div>
                            <hr className="bg-gray-100" />
                            <div className="custom-card-footer">
                                <div className="custom-progress-bar">
                                    <div className="progress-title">
                                        <span>Remaining Timeline</span>
                                        <span>Lock Duration <span style={{ color: 'white', fontWeight: 'bold' }}>{'12 days'}</span></span>
                                    </div>
                                    <ProgressBar now={ !myStartTimes[0] ? '-' : (12 - Number((currentTime - myStartTimes[0]) / 3600 / 24).toFixed(0)) / 12 * 100 } variant="pro" />
                                    <div className="progress-title">
                                        <span style={{ color: 'white', fontWeight: 'bold' }}>{}</span>
                                        <span style={{ color: 'white', fontWeight: 'bold' }}>{ (myStartTimes[0] ? (Number((currentTime - myStartTimes[0]) / 3600 / 24).toFixed(0) <= 13 ? (13 - Number((currentTime - myStartTimes[0]) / 3600 / 24).toFixed(0)  + '/' + '12 dyas') : 'Active') : '') }</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </Col>
                </Row>
            </Container>
            <MyModal isOpen = { isOpen } setIsOpen = {setIsOpen} onlyOneToast = {true}/>
            <BuyModal isOpen = { isOpenBuy } setIsOpen = {setIsOpenBuy} onlyOneToast = {false}/>

            <Toast onClose={() => setShowToastBuy(false)} show={showToastBuy} delay={7000} autohide>
                <Toast.Header>
                    <img
                    src="holder.js/20x20?text=%20"
                    className="rounded me-2"
                    alt=""
                    />
                    <strong className="me-auto">Notice</strong>
                    <small className="mr-auto"></small>
                </Toast.Header>
                <Toast.Body>{ toastTextBuy }</Toast.Body>
            </Toast>
        </>
    );
}