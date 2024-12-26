import React from 'react';
import Head from 'next/head';
import { ReactNode } from 'react';
import styles from '../styles/Home.module.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>Financial Advisory App</title>
        <meta name="description" content="Get personalized financial advice" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.container}>
        {children}
      </main>
    </>
  );
}