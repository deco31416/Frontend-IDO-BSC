import React, { useState, useEffect, useRef } from 'react';

import { SiWebpack, AiFillTwitterCircle, AiOutlineMedium, FaTelegramPlane, BsCircleFill, BiMoney } from 'react-icons/all';
import { ProgressBar } from 'react-bootstrap';
import tokenLogo from '../../assets/img/logo.png';
import MyModal from '../modal/Modal';
import BuyModal from '../modal/BuyModal';
import { useEthers, useTokenBalance } from "@usedapp/core";
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { 
    useAirdropContractMethod, 
    useSuniTokenContractMethod,
    useGetLastClaimedTime,
    useGetTotalClaimableAmount
} from '../../util/interact';
import { 
    suniTokenAddress, 
    nftTokenAddress 
} from '../../contract_ABI/vestingData';

export default function TokenDetail() {
    const unmounted = useRef(true);
    const project = {
        name: 'SUNI',
        status: 'Open',
        message: 'Any nft holders who holds nft for 12 days in wallet without listing for sale on opensea or transfer will start getting daily 7$ SUNI token from 13th day'
    };

    const currentTime = Math.round(new Date().getTime()/1000);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenBuy, setIsOpenBuy] = useState(false);
    const {account, chainId} = useEthers();

    const [myNfts, setMyNfts] = useState([]);
    const [myTokenIds, setMyTokenIds] = useState([]);
    const [myStartTimes, setMyStartTimes] = useState([]);
    
    const suniBalance = useTokenBalance(suniTokenAddress, account) / 10 ** 18;
    let nftBalance = useTokenBalance(nftTokenAddress, account);
    let lastClaimedTime = useGetLastClaimedTime(account, myNfts[0]);
    let totalClaimableAmount = useGetTotalClaimableAmount(myTokenIds, myStartTimes);

    useEffect( () => {
        getMyNft();
        claimToken('get');
        return () => { unmounted.current = false }
    }, []);

    useEffect( () => {
        console.log('sss', myNfts);
        return () => { unmounted.current = false }
    }, [ myNfts ]);
    

    function getMyNft() {
        var options1 = {
            method: 'GET',
            url: 'https://deep-index.moralis.io/api/v2/0x6050e98aA1B1c167F649A6C1814Bf2FAED265767/nft/0x8dBc499910BB2dC8D749e936F12227dBC1590329?chain=eth&format=decimal',
            headers: {Accept: 'application/json', 'X-API-KEY': 'aF6jKJDYuy0p8jXoA9hSwJn68VMevh9XKrENKU2XzMFRjTPAcjp1nHeDE6JESV2L'}
        };

        axios.request(options1).then(function (response) {
            let myNfts_tmp = [];
            console.log('options1', response.data.result);
            let result = response.data.result;
            result.map((item) => {
                myNfts_tmp.push({
                    token_id: item.token_id,
                    owner_of: item.owner_of,
                    token_address: item.token_address,
                });
            });

            console.log('options1', response.data.result);
            setMyNfts(myNfts_tmp);
          }).catch(function (error) {
            console.error(error);
        });
    }

    const { state: stateDoAirdrop, send: doAirdrop, events: getEventDoAirdrop } = useAirdropContractMethod("doAirdrop");
    function claimToken(option) {
        var options2 = {
            method: 'GET',
            url: 'https://deep-index.moralis.io/api/v2/0x6050e98aA1B1c167F649A6C1814Bf2FAED265767/nft/transfers?chain=eth&format=decimal&direction=both',
            headers: {Accept: 'application/json', 'X-API-KEY': 'aF6jKJDYuy0p8jXoA9hSwJn68VMevh9XKrENKU2XzMFRjTPAcjp1nHeDE6JESV2L'}
        };

        axios.request(options2).then(function (response) {
            console.log('options2', response.data.result);
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
                        startTimestamp = startTimestamp.getTime() / 1000;
                        
                        tokenIds.push(nftItem.token_id);
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
            
            console.log("this is my claim button!");
            console.log('result-------', claimReqInfo);
            console.log('tokenIds-------', tokenIds);
            console.log('startTimes-------', startTimes);
            if(option == 'claim')
                doAirdrop(tokenIds, startTimes, account);
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

    return (
        <>
            <Container>
                <Row>
                    <Col sm={5}>
                        <section className="mt-auto">
                            <div className="toekn-detail-header d-flex mt-5">
                                <div className="custom-card-title"><img className="tokenLogo mt-auto" src={tokenLogo} alt="project profile"></img></div>
                                <div className="custom-card-title"><h2 className="text-white mb-auto  tokenLogoTitle">Sassy Unicrons</h2></div>
                            </div>
                            <div className="custom-card-header">
                                <div className="custom-card-title">
                                    <div className="grid-box">
                                        <div className="text-white my-0 ml-3" style={{fontSize: '1.5rem'}}>SUNI</div>
                                        <div className="social-links">
                                            <a href="https://Casper-pad.com"><SiWebpack className="social-link" /></a>
                                            <a href="https://twitter.com/Casper_Pad"><AiFillTwitterCircle className="social-link" /></a>
                                            <a href="https://casperpad.medium.com"><AiOutlineMedium className="social-link" /></a>
                                            <a href=" https://t.me/CasperPadPublic"><FaTelegramPlane className="social-link" /></a>
                                        </div>
                                        <div></div>
                                    </div>
                                    <span className="status" style={{ backgroundColor: `${project.status === 'Coming' ? 'rgb(240 185 19 / 26%)' : project.status === 'Open' ? 'rgb(92 184 92 / 26%)' : 'rgb(255 0 0 / 25%)'}`, color: `${project.status === 'Coming' ? '#f1b90c' : project.status === 'Open' ? '#5cb85c' : 'red'}` }}>
                                        <BsCircleFill style={{ fontSize: '.6rem', verticalAlign: 'middle' }} />
                                        {project.status === 'Coming' ? ' Opens in TBA' : project.status === 'Open' ? ' Active' : ' Closed'}
                                    </span>
                                    <div className="buyBtnContainer d-flex">
                                        <span className="status">Passive Incomming</span>
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
                                    {(account && nftBalance > 0 && totalClaimableAmount > 0) && (
                                        <button className="btn btn-wallet wallet-connected" onClick={claimToken('calaim')}> Claim SUNI Token </button>
                                    ) }
                                </div>
                            </div>
                            <hr className="bg-gray-100" />
                            <div className="grid-box">
                                <div> Hold NFT </div>
                                <div> Total Claimable Amount: </div>
                            </div>
                            <div className="grid-box text-white">
                                <div> { nftBalance * 1 } </div>
                                <div> { nftBalance ? '-' : totalClaimableAmount * 7 + ' SUNI' } </div>
                            </div>
                            <div className="grid-box text-white">
                                <div>  </div>
                                <div> {nftBalance ? '-' : totalClaimableAmount * 7 + ' USD'} </div>
                            </div>
                            <hr className="bg-gray-100" />
                            <div className="grid-box">
                                <div> Start Date </div>
                                <div> Incomming Start Days: </div>
                            </div>
                            <div className="grid-box text-white">
                                <div> { lastClaimedTime == 0 ? new Date(lastClaimedTime * 1000).toLocaleString("en-US", {timeZone: "UTC"}) : '-' } </div>
                                <div> {12 + ' days'} </div>
                            </div>
                            <hr className="bg-gray-100" />
                            <div className="custom-card-footer">
                                <div className="custom-progress-bar">
                                    <div className="progress-title">
                                        <span>Remaining Timeline</span>
                                        <span>Lock Duration <span style={{ color: 'white', fontWeight: 'bold' }}>{'12 days'}</span></span>
                                    </div>
                                    <ProgressBar now={ myStartTimes[0] == 0 ? '-' : (Number((currentTime - myStartTimes[0]) / 3600 / 24).toFixed(0)) / 12 * 100 } variant="pro" />
                                    <div className="progress-title">
                                        <span style={{ color: 'white', fontWeight: 'bold' }}>{}</span>
                                        <span style={{ color: 'white', fontWeight: 'bold' }}>{ myStartTimes != NaN ? Number((currentTime - myStartTimes[0]) / 3600 / 24).toFixed(0)  + '/' + '12 dyas' : '-' }</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </Col>
                </Row>
            </Container>
            <MyModal isOpen = { isOpen } setIsOpen = {setIsOpen} onlyOneToast = {true}/>
            <BuyModal isOpen = { isOpenBuy } setIsOpen = {setIsOpenBuy} onlyOneToast = {false}/>
        </>
    );
}