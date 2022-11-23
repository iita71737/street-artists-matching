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

export const fetchArtist = async () =>{
  const Airtable = require("airtable");
  const base = new Airtable({ apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY }).base(
    process.env.NEXT_PUBLIC_AIRTABLE_BASE_KEY
  );
  const tableArtists = base("street-artist-list");
    tableArtists.select({
    // Selecting the first 3 records in Grid view:
    maxRecords: 3,
    view: "Grid view"
    }).eachPage(function page(records, fetchNextPage){
    // This function (`page`) will get called for each page of records.\
    const _records =  records.json()
    console.log(_records,'-_records')
    // return _records.map((record) => {
    //   // return record
    //   console.log(record)
    // });
    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();
  
  }, function done(err) {
    if (err) { 
      console.error(err); 
      return; 
    }
  });
}
