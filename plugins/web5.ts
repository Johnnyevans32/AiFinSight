import { Web5 } from "@web5/api";
import { useAppUserConfigStore } from "~/store/config";

export default defineNuxtPlugin(async () => {
  const { dwnEndpoint } = storeToRefs(useAppUserConfigStore());
  const { getUserPortableDidAndAgent } = useWeb5VueUtils();
  let web5: Web5;
  let did: string;

  try {
    console.log("connecting to web5", dwnEndpoint.value);
    const { managedDid, userAgent } = await getUserPortableDidAndAgent();
    ({ web5, did } = await Web5.connect({
      agent: userAgent,
      connectedDid: managedDid.did,
      techPreview: { dwnEndpoints: [dwnEndpoint.value] },
      sync: "60s",
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
