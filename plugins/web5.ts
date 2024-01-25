import { Web5 } from "@web5/api";

export default defineNuxtPlugin(async () => {
  const { getCustomDwnEndpoint } = useAppVueUtils();
  let web5: Web5;
  let did: string;

  try {
    console.log("connecting to web5");
    ({ web5, did } = await Web5.connect({
      techPreview: { dwnEndpoints: [getCustomDwnEndpoint()] },
      sync: "5s",
    }));
    console.log("connected to web5");
  } catch (err) {
    console.error("error from web5", err);
    throw err;
  }

  return {
    provide: {
      web5,
      did,
    },
  };
});
