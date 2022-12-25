import { useEffect, useState, useContext } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import Banner from "../components/banner";
import Card from "../components/card";

import { fetchCoffeeStores } from "../lib/coffee-stores";
import useTrackLocation from "../hooks/use-track-location";
import { ACTION_TYPES, StoreContext } from "../store/store-context";

import artistsJSON from "../data/taipei_artists.json";

import {
  fetchArtistByAirtable,
  fetchArtistMore,
  fetchArtistByLaravel,
  fetchArtistOtherPageByLaravel,
} from "../lib/airtable";

import { Typography, Box, Pagination } from "@mui/material";

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
  const artists = await fetchArtistByLaravel();

  return {
    props: {
      coffeeStores,
      artists: artists || null,
    },
  };
}

export default function Home(props) {
  const [params, setParams] = useState();
  const [moreArtist, setMoreArtist] = useState();

  const { handleTrackLocation, locationErrorMsg, isFindingLocation } =
    useTrackLocation();
  const [coffeeStoresError, setCoffeeStoresError] = useState(null);
  const { dispatch, state } = useContext(StoreContext);
  const { coffeeStores, latLong } = state;

  const handleOnBannerBtnClick = () => {
    handleTrackLocation();
  };

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

  useEffect(() => {
    const fetchData = async () => {
      const _fetchData = await fetchArtistOtherPageByLaravel({
        params: params,
      });
      setMoreArtist(_fetchData);
    };
    fetchData().catch(console.error);
  }, [params]);

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

        {props.artists && props.artists.length > 0 && (
          <>
            <div className={styles.sectionWrapper}>
              <h2 className={styles.heading2}>Show all artists</h2>
              <div className={styles.cardLayout}>
                {params === undefined &&
                  props.artists.map((artist) => {
                    return (
                      <Card
                        key={artist.id}
                        name={artist.name}
                        imgUrl={
                          artist.imgUrl ||
                          "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80"
                        }
                        href={`/coffee-store/${artist.id}`}
                        className={styles.card}
                      />
                    );
                  })}
                {params &&
                  moreArtist &&
                  moreArtist.length > 0 &&
                  moreArtist.map((artist) => {
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
                    );
                  })}
              </div>
            </div>
            <div className={styles.paginationContainer}>
              <Pagination
                count={37}
                color="secondary"
                size="large"
                onChange={(e, value) => setParams({ page: value })}
              />
            </div>
          </>
        )}

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
      </main>
    </div>
  );
}
