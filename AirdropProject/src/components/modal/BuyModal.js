import React, { useState, useEffect, useRef } from 'react';
import { useEthers, useTokenBalance } from "@usedapp/core";
import Modal from 'react-bootstrap/Modal';
import { Toast, Form, Row, Col } from 'react-bootstrap';
import metamask from "../../assets/icons/metamask.svg";
import binance from "../../assets/icons/binance.png";
import { 
    suniTokenAddress, 
    airdropContractAddress
} from '../../contract_ABI/vestingData';
import { 
    useSuniContractMethod,
    useAirdropContractMethod
} from '../../util/interact';

const BuyModal = ({ isOpen, setIsOpen, onlyOneToast}) => {
    const unmounted = useRef(true);
    const [isOpenBuy, setIsOpenBuy] = useState(false);
    const { account } = useEthers();
    const [showToastBuy, setShowToastBuy] = useState(false);
    const [toastTextBuy, setToastTextBuy] = useState('');

    useEffect( () => {

        return () => { unmounted.current = false }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    }
    const handleCloseBuy = () => setIsOpenBuy(false);

    function handleApprove() {
        
    }

    useEffect( () => {

        return () => { unmounted.current = false }
    }, [ ]);

    function handleSwitchCurrency(currency) {
        console.log(currency);
    }

    const { state: stateAddVest, send: addVest, events: getEventAddVest } = useAirdropContractMethod("addVest");
    function handleBuy() {
            addVest(Math.round(100), true, 'usd');
    }

    useEffect( () => {
        if(stateAddVest.status == 'Success') {
            handleCloseBuy();
            setShowToastBuy(true);
        }else if(stateAddVest.status == 'Exception') {
            handleCloseBuy();
            setShowToastBuy(true);
        }
        return () => { unmounted.current = false }
    }, [ stateAddVest ]);

    return (
      <>
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
        <Modal show={isOpen} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Approve</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
              
          <div className="outer bg-black absolute top-0 left-0 h-full w-full z-20 opacity-80"></div>

            <div className="absolute top-0 left-0 h-full w-full z-30 flex items-center justify-center" onClick={() => handleClose()} >
                <div className="inner max-w-screen-sm flex-grow  text-white  bg-gradient-to-br from-yellow-200 to-yellow-700 p-1 opacity-100 rounded-3xl" onClick={ (e) => { e.stopPropagation(); }} >
                    {account && (
                        <>
                            <div data-bs-dismiss="modal" id="wallet-connect-metamask" className="c-list border-b px-3 py-2 d-flex align-items-center">
                                <div className="text-white m-auto"> The Buyable Maximum Amount Of Your Tier Is $! <br/>(Note: You can insert the token to the vesting schedule with only one buying.)</div>
                            </div>
                            <div data-bs-dismiss="modal" id="wallet-connect-metamask" className="c-list border-b px-3 py-2 d-flex align-items-center">
                                <div className="text-white m-auto"> 
                                    <Form>
                                        <Form.Check
                                            inline
                                            defaultChecked={'payCurrency' == 'usdtTokenAddress' ? true : false}
                                            label="USDT"
                                            name="group1"
                                            type="radio"
                                            id="inline-radio-1"
                                            onClick={() => handleSwitchCurrency('usdt')}
                                        />
                                        <Form.Check
                                            inline
                                            defaultChecked={'payCurrency' == 'busdTokenAddress' ? true : false}
                                            label="BUSD"
                                            name="group1"
                                            type="radio"
                                            id="inline-radio-2"
                                            onClick={() => handleSwitchCurrency('busd')}
                                        />
                                    </Form>
                                </div>
                                <div>
                                    {/* <input className='form-control' type="number" step="0.1"  value={ 'buyUsdAmount' } onChange={e => setBuyUsdAmount(e.target.value)} /> */}
                                </div>
                            </div>
                            <div data-bs-dismiss="modal" id="wallet-connect-metamask" className="c-list border-b px-3 py-2 d-flex align-items-center">
                                <div className="text-white m-auto"> CSPD</div>
                                <div>
                                    <input className='form-control' type="text" value={ 'buyCspdAmount' } disabled/>
                                </div>
                            </div>
                            <div data-bs-dismiss="modal" id="wallet-connect-metamask" className="c-list border-b px-3 py-2 d-flex align-items-center cursor-pointer">
                                <button className="btn btn-wallet wallet-connected m-auto" onClick={ handleClose }> Cancel </button>
                                <button className="btn btn-wallet wallet-connected m-auto" onClick={ handleApprove }> Enable</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
          </Modal.Body>
        </Modal>

        <Modal show={isOpenBuy} onHide={handleCloseBuy}>
          <Modal.Header closeButton>
            <Modal.Title>Buy CSPD Token</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
              
          <div className="outer bg-black absolute top-0 left-0 h-full w-full z-20 opacity-80"></div>

            <div className="absolute top-0 left-0 h-full w-full z-30 flex items-center justify-center" onClick={() => handleCloseBuy()} >
                <div className="inner max-w-screen-sm flex-grow  text-white  bg-gradient-to-br from-yellow-200 to-yellow-700 p-1 opacity-100 rounded-3xl" onClick={ (e) => { e.stopPropagation(); }} >
                    {account && (
                        <>
                            <div data-bs-dismiss="modal" id="wallet-connect-metamask" className="c-list border-b px-3 py-2 d-flex align-items-center">
                                <div className="text-white m-auto"> Approve Successfully! </div>
                            </div>
                            <div data-bs-dismiss="modal" id="wallet-connect-metamask" className="c-list border-b px-3 py-2 d-flex align-items-center">
                                <div className="text-white m-auto"> USD</div>
                                <div>
                                    <input className='form-control' type="number" value={ 'buyUsdAmount' } disabled />
                                </div>
                            </div>
                            <div data-bs-dismiss="modal" id="wallet-connect-metamask" className="c-list border-b px-3 py-2 d-flex align-items-center">
                                <div className="text-white m-auto"> CSPD</div>
                                <div>
                                    <input className='form-control' type="text" value={ 'buyCspdAmount' } disabled/>
                                </div>
                            </div>
                            <div data-bs-dismiss="modal" id="wallet-connect-metamask" className="c-list border-b px-3 py-2 d-flex align-items-center cursor-pointer">
                                <button className="btn btn-wallet wallet-connected m-auto" onClick={ handleBuy }> Buy </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
          </Modal.Body>
        </Modal>
      </>
    );
  }
  
  export default BuyModal;