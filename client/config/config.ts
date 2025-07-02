import { v4 as uuidv4 } from "uuid";

export const config = {
  // API base URL
  backendBaseUrl: "http://10.0.2.2:3000/api",
  // generate new random UUID for each user
  username: `${uuidv4()}`,
};
