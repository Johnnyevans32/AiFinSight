import { useAppStore } from "~/store";

class UserService {
  async ping() {
    try {
      const { useCustomFetch } = useAppVueUtils();
      const { myDid } = storeToRefs(useAppStore());
      await useCustomFetch(`/api/users/ping`, {
        method: "post",
        body: { did: myDid.value },
      });
    } catch (err) {
      console.log("error from ping", { err });
    }
  }
}

export default UserService;
