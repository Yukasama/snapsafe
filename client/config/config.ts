import { v4 as uuidv4 } from "uuid";

export const config = {
  // API base URL
  backendBaseUrl: "https://snapsafe.marml.com/api",
  // generate new random UUID for each user
  username: `${uuidv4()}`,
};
