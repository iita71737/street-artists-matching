import { useEffect, useState, useContext } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import Banner from "../components/banner";
import Card from "../components/card";

import { fetchCoffeeStores } from "../lib/coffee-stores";
import useTrackLocation from "../hooks/use-track-location";
import { ACTION_TYPES, StoreContext } from "../store/store-context";

import artistsJSON from '../data/artist.json'
import Airtable from 'airtable';

export async function getStaticProps(context) {
  if (
    !process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY &&
    !process.env.AIRTABLE_API_KEY &&
    !process.env.AIRTABLE_BASE_KEY &&
    !process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
  ) {
    return {
      redirect: {
        destination: "/problem",
        permanent: false,
      },
    };
  }
  const coffeeStores = await fetchCoffeeStores();
 
  const airtable = new Airtable({
    apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY ,
  });

  const records = await airtable
    .base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_KEY)('street-artist-list')
    .select({
      // maxRecords: 3,
      // fields: ['certificateNo', 'name', 'id', 'category', 'subcategory'],
    })
    .all();

  const artists = records.map((record) => {
    return {
      id: record.get('id'),
      certificateNo : record.get('certificateNo'),
      name: record.get('name'),
      category: record.get('category') ? record.get('category') : null,
      subcategory: record.get('subcategory') ? record.get('subcategory') : null,
      subcategoryDes: record.get('subcategoryDes') ?  record.get('subcategoryDes') : null,
      introUrl: record.get('introUrl') ? record.get('introUrl') : null,
      stageName: record.get('stageName') ? record.get('stageName') : null,
      set: record.get('sex') ? record.get('sex') : null,
      phone: record.get('phone') ? record.get('phone') : null,
      email: record.get('email') ? record.get('email') : null
    };
  });

  console.log(artists,'-artists')

  return {
    props: {
      coffeeStores,
      artists : artists || null
    }
  };
}

export default function Home(props) {
  const { handleTrackLocation, locationErrorMsg, isFindingLocation } =
    useTrackLocation();

  const [coffeeStoresError, setCoffeeStoresError] = useState(null);

  const { dispatch, state } = useContext(StoreContext);

  const { coffeeStores, latLong } = state;

  useEffect(() => {
    async function setCoffeeStoresByLocation() {
      if (latLong) {
        try {
          const response = await fetch(
            `/api/getCoffeeStoreByLocation?latLong=${latLong}&limit=30`
          );

          const coffeeStores = await response.json();

          dispatch({
            type: ACTION_TYPES.SET_COFFEE_STORES,
            payload: {
              coffeeStores,
            },
          });
          setCoffeeStoresError("");

        } catch (error) {

          console.error({ error });
          setCoffeeStoresError(error.message);
        }
      }
    }
    setCoffeeStoresByLocation();
  }, [dispatch, latLong]);

  const handleOnBannerBtnClick = () => {
    handleTrackLocation();
  };


  return (
    <div className={styles.container}>
      <Head>
        <title>Street Artist</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="allows you to discover coffee stores"
        />
      </Head>

      <main className={styles.main}>
        <Banner
          buttonText={isFindingLocation ? "Locating..." : "View artist nearby"}
          handleOnClick={handleOnBannerBtnClick}
        />
        {locationErrorMsg && <p>Something went wrong: {locationErrorMsg}</p>}
        {coffeeStoresError && <p>Something went wrong: {coffeeStoresError}</p>}
        <div className={styles.heroImage}>
          <Image
            src="/static/logo-mini.png"
            width={300}
            height={300}
            alt="hero image"
          />
        </div>

        {coffeeStores.length > 0 && (
          <div className={styles.sectionWrapper}>
            <h2 className={styles.heading2}>Show near me</h2>
            <div className={styles.cardLayout}>
              {coffeeStores.map((coffeeStore) => {
                return (
                  <Card
                    key={coffeeStore.id}
                    name={coffeeStore.name}
                    imgUrl={
                      coffeeStore.imgUrl ||
                      "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
                    }
                    href={`/coffee-store/${coffeeStore.id}`}
                    className={styles.card}
                  />
                );
              })}
            </div>
          </div>
        )}

      {props.artists && props.artists.length > 0 && (
        <div className={styles.sectionWrapper}>
        <h2 className={styles.heading2}>Show all artists</h2>
        <div className={styles.cardLayout}>
        { props.artists.map(artist => {
          return (
            <Card
            key={artist.id}
            name={artist.name}
            imgUrl={
              artist.imgUrl ||
              "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
            }
            href={`/coffee-store/${artist.id}`}
            className={styles.card}
            />
            )
        }) 
        }
          </div>
      </div>
      )}

        <div className={styles.sectionWrapper}>
          {props.coffeeStores.length > 0 && (
            <>
              <h2 className={styles.heading2}>Toronto stores</h2>
              <div className={styles.cardLayout}>
                {props.coffeeStores.map((coffeeStore) => {
                  return (
                    <Card
                      key={coffeeStore.id}
                      name={coffeeStore.name}
                      imgUrl={
                        coffeeStore.imgUrl ||
                        "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
                      }
                      href={`/coffee-store/${coffeeStore.id}`}
                      className={styles.card}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
