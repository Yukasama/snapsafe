import { v4 as uuidv4 } from "uuid";

export const config = {
  // API base URL
  backendBaseUrl: "http://34.32.102.125:50648/api",
  // generate new random UUID for each user
  username: `${uuidv4()}`,
};
