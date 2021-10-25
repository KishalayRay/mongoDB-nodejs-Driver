const { MongoClient } = require("mongodb");

const main = async () => {
  const uri = `mongodb://localhost:27017`;
  const client = new MongoClient(uri);
  const dbName = "sample_arbnb";
  try {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    const collection = db.collection("listingsAndReviews");

    /*Update*/
    //await updateListingByName(collection, "Infinite Views", { bathrooms: 4 });

    /*Upsert */
    await upsertListingByName(collection, "Private room in London", {
      name: "Private room London",
      bedrooms: 4,
    });

    /*Find with filter*/
    //await findListingsByMoreFilter(collection, {
    //   minimumNumberOfBedrooms: 1,
    //   minimumNumberOfBathrooms: 1,
    //   maximumNumberOfResults: 5,
    // });

    /*Find One*/
    //await findOneListingByName(collection, "Infinite Views");

    /*Create Multiple*/
    // await cerateMultipleListings(collection, [
    //   {
    //     name: "Infinite Views",
    //     summary: "Modern home with infinite views from the infinity pool",
    //     property_type: "House",
    //     bedrooms: 5,
    //     bathrooms: 4.5,
    //     beds: 5,
    //   },
    //   {
    //     name: "Private room in London",
    //     property_type: "Apartment",
    //     bedrooms: 1,
    //     bathroom: 1,
    //   },
    //   {
    //     name: "Beautiful Beach House",
    //     summary:
    //       "Enjoy relaxed beach living in this house with a private beach",
    //     bedrooms: 4,
    //     bathrooms: 2.5,
    //     beds: 7,
    //     last_review: new Date(),
    //   },
    // ]);
  } catch (e) {
    console.error(e);
  }
  //   } finally {
  //     await client.close();
  //   }
};
main().catch(console.error);

const listDatabases = async (client) => {
  const databaseList = await client.db().admin().listDatabases();
  databaseList.databases.forEach((e) => {
    console.log(e.name);
  });
};

const createListing = async (collection, newListing) => {
  const result = await collection.insertOne(newListing);
  console.log(
    `New listing created with the following id: ${result.insertedId}`
  );
};

const cerateMultipleListings = async (collection, newListing) => {
  const result = await collection.insertMany(newListing);
  console.log(
    ` ${result.insertedCount} new listings created with the following id(s):`
  );
  console.log(result.insertedIds);
};

const findOneListingByName = async (collection, nameOfListing) => {
  const result = await collection.findOne({ name: nameOfListing });
  if (result) {
    console.log(
      `Found a listing in the collection with the name ${nameOfListing}`
    );
    console.log(result);
  } else {
    console.log(`No listing found`);
  }
  console.log();
};

const findListingsByMoreFilter = async (
  collection,
  {
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER,
  }
) => {
  const cursor = await collection
    .find({
      bedrooms: { $gte: minimumNumberOfBedrooms },
      bathrooms: { $gte: minimumNumberOfBathrooms },
    })
    .sort({ last_review: -1 })
    .limit(maximumNumberOfResults);
  const results = await cursor.toArray();
  if (results.length > 0) {
    console.log(
      `Found listings with at least  ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms:`
    );
    results.forEach((result, i) => {
      const date = new Date(result.last_review).toDateString();
      console.log();
      console.log(`${i + 1}. name: ${result.name}`);
      console.log(` _id:${result._id}`);
      console.log(`bedrooms:${result.bedrooms}`);
      console.log(`bathrooms:${result.bathrooms}`);
      console.log(`most recent review date:${date}`);
    });
  } else {
    console.log(
      `No listings found with at least  ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`
    );
  }
};

const updateListingByName = async (
  collection,
  nameOfListing,
  updatedListing
) => {
  const result = await collection.updateOne(
    { name: nameOfListing },
    { $set: updatedListing }
  );
  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  console.log(`${result.modifiedCount} documents(s) was/were updated`);
};

const upsertListingByName = async (
  collection,
  nameOfListing,
  updatedListing
) => {
  const result = await collection.updateOne(
    { name: nameOfListing },
    { $set: updatedListing },
    { upsert: true }
  );
  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  if (result.upsert > 0) {
    console.log(`One document was inserted with the id ${result.upsertedId}`);
  } else {
    console.log(`${result.modifiedCount} document(s) was/were updated`);
  }
};
