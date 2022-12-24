import axios from "axios";

const Airtable = require("airtable");
const base = new Airtable({ apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY }).base(
  process.env.NEXT_PUBLIC_AIRTABLE_BASE_KEY
);

const table = base("coffee-stores");

const getMinifiedRecord = (record) => {
  return {
    recordId: record.id,
    ...record.fields,
  };
};

const getMinifiedRecords = (records) => {
  return records.map((record) => getMinifiedRecord(record));
};

const findRecordByFilter = async (id) => {
  const findCoffeeStoreRecords = await table
    .select({
      filterByFormula: `id="${id}"`,
    })
    .firstPage();

  return getMinifiedRecords(findCoffeeStoreRecords);
};

export { table, getMinifiedRecords, findRecordByFilter };

// API fetch init artists
export const fetchArtistByAirtable = async () =>{
  const airtable = new Airtable({
    apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY ,
  });

  const records = await airtable
    .base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_KEY)('street-artist-list')
    .select({
      maxRecords: 10,
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
      sex: record.get('sex') ? record.get('sex') : null,
      phone: record.get('phone') ? record.get('phone') : null,
      email: record.get('email') ? record.get('email') : null
    };
  });
  return artists
}

// API fetch more artists
export const fetchArtistMoreByAirtable = async (page) => {
  const matchingRecords = [];

  const airtable = new Airtable({
    apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY ,
  });
  const records = await airtable
    .base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_KEY)('street-artist-list')
    .select({
      maxRecords: 10,
      pageSize: 10 * page
      // fields: ['certificateNo', 'name', 'id', 'category', 'subcategory'],
    }).eachPage(function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.
  
      records.forEach(function(record) {
          const _record = {
            id: record.get('id'),
            certificateNo : record.get('certificateNo'),
            name: record.get('name'),
            category: record.get('category') ? record.get('category') : null,
            subcategory: record.get('subcategory') ? record.get('subcategory') : null,
            subcategoryDes: record.get('subcategoryDes') ?  record.get('subcategoryDes') : null,
            introUrl: record.get('introUrl') ? record.get('introUrl') : null,
            stageName: record.get('stageName') ? record.get('stageName') : null,
            sex: record.get('sex') ? record.get('sex') : null,
            phone: record.get('phone') ? record.get('phone') : null,
            email: record.get('email') ? record.get('email') : null
          };
          matchingRecords.push(_record);
      });
  
      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage();
  
  }, function done(err) {
      if (err) { console.error(err); return; }
  });
  return matchingRecords
}

export const fetchArtistByLaravel = async () =>{
    try {
      const result = await axios.get('http://localhost:8000/api/taipei_artist');
      const artists = result.data;
      return artists.data
  } catch (error) {
      console.log(error);
  }
}

export const fetchArtistOtherPageByLaravel = async ({params}) =>{
  try {
    const result = await axios.get('http://localhost:8000/api/taipei_artist', {
      params: {
        ...params
      }
    }); 
    const artists = result.data;
    return artists.data
  } catch (error) {
      console.log(error);
  }
}
