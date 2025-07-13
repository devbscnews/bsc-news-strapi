require("dotenv").config();

const cachePurge = async (slugname) => {
  const fe_url = process.env.FRONT_END_URL;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    let res1 = await fetch(`${fe_url}/api/revalidate?tag=all-routes`);
    let res1Data = await res1.json();
    await delay(5000);
    let res2 = await fetch(`${fe_url}/api/revalidate?tag=all-posts`);
    let res2Data = await res2.json();
    await delay(5000);
    if (slugname) {
      let res3 = await fetch(`${fe_url}/api/revalidate?tag=${slugname}`);
      let res3Data = await res3.json();
      let res4 = await fetch(
        `${fe_url}/api/revalidatepath?path=/post/${slugname}`
      );
      let res4Data = await res4.json();
      let res5 = await fetch(`${fe_url}/api/revalidatepath?path=/`);
      let res5Data = await res5.json();
    }
  } catch (error) {}
};

const cachePurgeV2 = async (data) => {
  const fe_url = process.env.FRONT_END_URL;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    await delay(2000);

    let res3 = await fetch(`${fe_url}/api/purgecache`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    let res3Data = await res3.json();
    console.log(res3Data.data.cfPurgeData);

    console.log("Successfully Purged");
  } catch (error) {}
};

module.exports = {
  afterCreate(event) {
    const { result, params } = event;

    // cachePurge(result.Slug);
    cachePurgeV2(result);
    console.log("Created", result.Slug);
  },
  afterUpdate(event) {
    const { result, params } = event;

    // cachePurge(result.Slug);
    cachePurgeV2(result);
    console.log("Updated", result.Slug);
  },
  afterDelete(event) {
    const { result, params } = event;

    cachePurge(result.Slug);
    cachePurgeV2(result);
    console.log("Deleted", result.Slug);
  },
};
