import { Polar } from "@polar-sh/sdk";

export function getPolarClient(env: {
  POLAR_ACCESS_TOKEN: string;
}) {
  return new Polar({
    accessToken: env.POLAR_ACCESS_TOKEN,
    server: "sandbox",
  
  });
}