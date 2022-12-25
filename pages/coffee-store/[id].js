import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";

import useSWR from "swr";

import cls from "classnames";

import styles from "../../styles/coffee-store.module.css";

import { fetchCoffeeStores, fetchArtistById } from "../../lib/coffee-stores";
import { StoreContext } from "../../store/store-context";
import { fetcher, isEmpty } from "../../utils";

export async function getStaticPaths() {
  return {
    paths: [{ params: { id: "1" } }, { params: { id: "2" } }],
    fallback: true,
  };
}

export async function getStaticProps(staticProps) {
  const params = staticProps.params;
  const artist = await fetchArtistById(params.id);
  return {
    props: {
      artist: artist ? artist : {},
    },
  };
}

const CoffeeStore = (initialProps) => {
  const router = useRouter();
  const id = router.query.id;

  const [artist, setArtist] = useState(initialProps.artist || {});

  const {
    name = "",
    category = "",
    subcategory = "",
    subcategoryDes = "",
    introUrl = "",
    imgUrl = "",
    email = "",
  } = artist;

  // vote
  const [votingCount, setVotingCount] = useState(0);
  const { data, error } = useSWR(
    id ? `/api/taipei_artist/${id}` : null,
    fetcher
  );
  useEffect(() => {
    if (data && data.length > 0) {
      setArtist(data);
    }
  }, [data]);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const handleUpvoteButton = async () => {
    try {
      const response = await fetch("/api/favouriteCoffeeStoreById", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const dbCoffeeStore = await response.json();

      if (dbCoffeeStore && dbCoffeeStore.length > 0) {
        let count = votingCount + 1;
        setVotingCount(count);
      }
    } catch (err) {
      console.error("Error upvoting the coffee store", err);
    }
  };

  if (error) {
    return <div>Something went wrong retrieving coffee store page</div>;
  }

  return (
    <div className={styles.layout}>
      <Head>
        <title>{name}</title>
        <meta name="description" content={`${name} coffee store`} />
      </Head>
      <div className={styles.container}>
        <div className={styles.col1}>
          <div className={styles.backToHomeLink}>
            <Link href="/">
              <a>← Back to home</a>
            </Link>
          </div>
          <div className={styles.nameWrapper}>
            <h1 className={styles.name}>{name}</h1>
          </div>
          <Image
            src={
              imgUrl ||
              "https://images.unsplash.com/photo-1549349807-4575e87c7e6a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=742&q=80"
            }
            width={768}
            height={1200}
            className={styles.storeImg}
            alt={name}
          />
        </div>

        <div className={cls("glass", styles.col2)}>
          {category && (
            <div className={styles.iconWrapper}>
              <Image
                src="/static/icons/places.svg"
                width="24"
                height="24"
                alt="places icon"
              />
              <p className={styles.text}>
                {"表演類型"}
                {"："}
                {category}
              </p>
            </div>
          )}
          {subcategory && (
            <div className={styles.iconWrapper}>
              <Image
                src="/static/icons/nearMe.svg"
                width="24"
                height="24"
                alt="near me icon"
              />
              <p className={styles.text}>
                {"表演項目"}
                {"："}
                {subcategory}
              </p>
            </div>
          )}
          {subcategoryDes && (
            <div className={styles.iconWrapper}>
              <Image
                src="/static/icons/star.svg"
                width="24"
                height="24"
                alt="star icon"
              />
              <p className={styles.text}>
                {"表演項目簡述"}
                {"："}
                {subcategoryDes}
              </p>
            </div>
          )}
          {/* <button className={styles.upvoteButton} onClick={handleUpvoteButton}>
            Up vote!
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default CoffeeStore;
