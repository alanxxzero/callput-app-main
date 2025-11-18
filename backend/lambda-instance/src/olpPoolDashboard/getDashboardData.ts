import dayjs from "dayjs";
import { fetchDataFromS3 } from "../utils/aws";

export const getDashboardData = async () => {
  try {
    const { DUNE_DATA_BUCKET, MOBY_DATA_OLP_DASHBOARD_KEY} = process.env;
    const Bucket = DUNE_DATA_BUCKET;
    const Key = MOBY_DATA_OLP_DASHBOARD_KEY;

    const initialData = {
      last_updated: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      olp_performance: {},
      revenue: {}
    }
    const data = await fetchDataFromS3({ Bucket, Key, initialData });
    return data;
  } catch (error) {
    console.log("Error fetching dashboard data: ", error);
    return null;
  }
}