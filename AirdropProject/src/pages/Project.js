import React from 'react';
import { useParams } from 'react-router-dom'

import Header from '../components/Header';
import Footer from '../components/Footer';
import Background from '../components/Background';
import TokenDetail from '../components/Project/TokenDetail';

export default function Projects() {
    console.log(useParams().address)
    const option = useParams().address;
    return (
        <>
            <Header />
            <Background />
            <TokenDetail />
            <Footer />
        </>
    )
}